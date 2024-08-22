import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { Hash } from "./hash.js";
import type { SysBuf } from "./buf.js";
import { FixedBuf } from "./buf.js";
import { EbxBuf } from "./buf.js";
import { U8, U16, U32, U64, U256 } from "./numbers.js";
import { GenericError } from "./error.js";
import { WORK_SER_ALGO_NUM, WORK_SER_ALGO_NAME } from "./work-ser-algo.js";
import { WORK_PAR_ALGO_NUM, WORK_PAR_ALGO_NAME } from "./work-par-algo.js";

interface HeaderInterface {
  version: U8;
  prevBlockId: FixedBuf<32>;
  rootMerkleNodeId: FixedBuf<32>;
  nTransactions: U64;
  timestamp: U64;
  blockNum: U32;
  target: U256;
  nonce: U256;
  workSerAlgo: U16;
  workSerHash: FixedBuf<32>;
  workParAlgo: U16;
  workParHash: FixedBuf<32>;
}

export class Header implements HeaderInterface {
  version: U8;
  prevBlockId: FixedBuf<32>;
  rootMerkleNodeId: FixedBuf<32>;
  nTransactions: U64;
  timestamp: U64; // milliseconds
  blockNum: U32;
  target: U256;
  nonce: U256;
  workSerAlgo: U16;
  workSerHash: FixedBuf<32>;
  workParAlgo: U16;
  workParHash: FixedBuf<32>;

  // exactly two weeks if block interval is 10 minutes
  static readonly BLOCKS_PER_TWO_WEEKS = new U32(2016n);

  // 600_000 milliseconds = 600 seconds = 10 minutes
  static readonly BLOCK_INTERVAL_MS = new U64(600_000);

  static readonly SIZE = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32;
  static readonly MAX_TARGET_BYTES = FixedBuf.alloc(32, 0xff);
  static readonly MAX_TARGET_U256 = U256.fromBEBuf(Header.MAX_TARGET_BYTES.buf);

  constructor({
    version = new U8(0),
    prevBlockId = FixedBuf.alloc(32),
    rootMerkleNodeId = FixedBuf.alloc(32),
    nTransactions = new U64(0),
    timestamp = new U64(0),
    blockNum = new U32(0),
    target = new U256(0),
    nonce = new U256(0),
    workSerAlgo = new U16(0),
    workSerHash = FixedBuf.alloc(32),
    workParAlgo = new U16(0),
    workParHash = FixedBuf.alloc(32),
  }: Partial<HeaderInterface> = {}) {
    this.version = version;
    this.prevBlockId = prevBlockId;
    this.rootMerkleNodeId = rootMerkleNodeId;
    this.nTransactions = nTransactions;
    this.timestamp = timestamp;
    this.blockNum = blockNum;
    this.target = target;
    this.nonce = nonce;
    this.workSerAlgo = workSerAlgo;
    this.workSerHash = workSerHash;
    this.workParAlgo = workParAlgo;
    this.workParHash = workParHash;
  }

  toBuf(): SysBuf {
    return this.toBufWriter(new BufWriter()).toBuf();
  }

  static fromBuf(buf: SysBuf): Header {
    return Header.fromBufReader(new BufReader(buf));
  }

  static fromBufReader(br: BufReader): Header {
    const version = br.readU8();
    const prevBlockId = br.readFixed(32);
    const merkleRoot = br.readFixed(32);
    const nTransactions = br.readU64BE();
    const timestamp = br.readU64BE();
    const blockNum = br.readU32BE();
    const target = br.readU256BE();
    const nonce = br.readU256BE();
    const workSerAlgo = br.readU16BE();
    const workSerHash = br.readFixed(32);
    const workParAlgo = br.readU16BE();
    const workParHash = br.readFixed(32);
    return new Header({
      version,
      prevBlockId,
      rootMerkleNodeId: merkleRoot,
      nTransactions,
      timestamp,
      blockNum,
      target,
      nonce,
      workSerAlgo,
      workSerHash,
      workParAlgo,
      workParHash,
    });
  }

  toBufWriter(bw: BufWriter): BufWriter {
    bw.writeU8(this.version);
    bw.write(this.prevBlockId.buf);
    bw.write(this.rootMerkleNodeId.buf);
    bw.writeU64BE(this.nTransactions);
    bw.writeU64BE(this.timestamp);
    bw.writeU32BE(this.blockNum);
    bw.writeU256BE(this.target);
    bw.writeU256BE(this.nonce);
    bw.writeU16BE(this.workSerAlgo);
    bw.write(this.workSerHash.buf);
    bw.writeU16BE(this.workParAlgo);
    bw.write(this.workParHash.buf);
    return bw;
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromHex(str: string): Header {
    return Header.fromBuf(EbxBuf.fromHex(Header.SIZE, str).buf);
  }

  toString(): string {
    return this.toHex();
  }

  static fromString(str: string): Header {
    return Header.fromHex(str);
  }

  isTargetValid(lch2016: Header[]): boolean {
    let newTarget: U256;
    try {
      const prevHeader = lch2016[lch2016.length - 1] as Header;
      const prevPrevHeader = lch2016[lch2016.length - 2] || null;
      newTarget = Header.newTargetFromPrevHeaders(prevHeader, prevPrevHeader);
    } catch (e) {
      return false;
    }
    return this.target.bn === newTarget.bn;
  }

  isIdValid(): boolean {
    const id = this.id();
    const idNum = U256.fromBEBuf(id.buf);
    return idNum.bn < this.target.bn;
  }

  isVersionValid(): boolean {
    return this.version.n === 0;
  }

  isTimestampValidAt(timestamp: U64): boolean {
    return this.timestamp.n <= timestamp.n;
  }

  isWorkSerAlgoValid(): boolean {
    // can change with blockNum
    return this.workSerAlgo.n === WORK_SER_ALGO_NUM.blake3_3;
  }

  isWorkParAlgoValid(): boolean {
    // can change with blockNum
    return this.workParAlgo.n === WORK_PAR_ALGO_NUM.algo1627;
  }

  isValidInLch2016(lch2016: Header[]): boolean {
    if (!this.isVersionValid()) {
      //console.log('1')
      return false;
    }
    if (this.blockNum.bn === 0n) {
      //console.log('2')
      return this.isGenesis();
    }
    if (lch2016.length === 0) {
      //console.log('3')
      return false;
    }
    const lastHeader = lch2016[lch2016.length - 1] as Header;
    if (this.blockNum.n !== lastHeader.blockNum.n + 1) {
      //console.log('4')
      return false;
    }
    if (!this.prevBlockId.buf.equals(lastHeader.id().buf)) {
      //console.log('5')
      return false;
    }
    if (this.timestamp.n <= lastHeader.timestamp.n) {
      //console.log('6')
      return false;
    }
    if (!this.isTargetValid(lch2016)) {
      //console.log('7')
      return false;
    }
    if (!this.isIdValid()) {
      //console.log('8')
      return false;
    }
    if (!this.isWorkSerAlgoValid()) {
      //console.log('9')
      return false;
    }
    if (!this.isWorkParAlgoValid()) {
      //console.log('10')
      return false;
    }
    return true;
  }

  isValidAt(lch: Header[], timestamp: U64): boolean {
    // this validates everything about the header except PoW
    // PoW must be validated using a separate library
    return this.isTimestampValidAt(timestamp) && this.isValidInLch2016(lch);
  }

  isValidNow(lch: Header[]): boolean {
    return this.isValidAt(lch, Header.getNewTimestamp());
  }

  isGenesis(): boolean {
    return (
      this.blockNum.bn === 0n &&
      this.prevBlockId.buf.every((byte) => byte === 0) &&
      this.workSerAlgo.n === WORK_SER_ALGO_NUM.blake3_3 &&
      this.workParAlgo.n === WORK_PAR_ALGO_NUM.algo1627
    );
  }

  static fromGenesis(initialTarget: U256, merkleRoot: FixedBuf<32>): Header {
    const timestamp = new U64(Math.floor(Date.now())); // milliseconds
    const nonce = U256.fromBEBuf(FixedBuf.fromRandom(32).buf);
    return new Header({
      version: new U8(0),
      prevBlockId: FixedBuf.alloc(32),
      rootMerkleNodeId: merkleRoot,
      timestamp,
      blockNum: new U32(0n),
      target: initialTarget,
      nonce,
      workSerAlgo: new U16(WORK_SER_ALGO_NUM.blake3_3),
      workSerHash: FixedBuf.alloc(32),
      workParAlgo: new U16(WORK_PAR_ALGO_NUM.algo1627),
      workParHash: FixedBuf.alloc(32),
    });
  }

  isEmpty(): boolean {
    return this.rootMerkleNodeId.buf.every((byte) => byte === 0);
  }

  hash(): FixedBuf<32> {
    return Hash.blake3Hash(this.toBuf());
  }

  id(): FixedBuf<32> {
    return Hash.doubleBlake3Hash(this.toBuf());
  }

  static getNewTimestamp(): U64 {
    return new U64(Math.floor(Date.now()));
  }

  static fromLch2016(
    lch2016: Header[],
    merkleRoot: FixedBuf<32>,
    nTransactions: U64,
    newTimestamp: U64,
  ): Header {
    if (lch2016.length === 0) {
      throw new GenericError("lch2016 must not be empty");
    }
    if (lch2016.length > Header.BLOCKS_PER_TWO_WEEKS.n) {
      throw new GenericError("lch2016 must not be longer than 2016 blocks");
    }
    const prevHeader = lch2016[lch2016.length - 1] as Header;
    const prevPrevHeader = lch2016[lch2016.length - 2] || null;
    const target = Header.newTargetFromPrevHeaders(prevHeader, prevPrevHeader);
    const prevBlockId = prevHeader.id();
    const blockNum = prevHeader.blockNum.add(new U32(1));
    const timestamp = newTimestamp;
    const nonce = new U256(0);
    const workSerAlgo = new U16(WORK_SER_ALGO_NUM.blake3_3);
    const workSerHash = FixedBuf.alloc(32);
    const workParAlgo = new U16(WORK_PAR_ALGO_NUM.algo1627);
    const workParHash = FixedBuf.alloc(32);
    return new Header({
      version: new U8(0),
      prevBlockId,
      rootMerkleNodeId: merkleRoot,
      nTransactions,
      timestamp,
      blockNum,
      target,
      nonce,
      workSerAlgo,
      workSerHash,
      workParAlgo,
      workParHash,
    });
  }

  static newTargetFromPrevHeaders(
    prevHeader: Header,
    prevPrevHeader: Header | null,
  ): U256 {
    const newDifficulty = Header.newDifficultyFromPrevHeaders(
      prevHeader,
      prevPrevHeader,
    );
    return Header.targetFromDifficulty(newDifficulty);
  }

  static newDifficultyFromPrevHeaders(
    prevHeader: Header,
    prevPrevHeader: Header | null,
  ): U64 {
    if (!prevPrevHeader) {
      return prevHeader.difficulty();
    }
    const prevTimeDiff = new U64(
      prevHeader.timestamp.n - prevPrevHeader.timestamp.n,
    );
    const prevDifficulty = prevHeader.difficulty();
    const idealTimeDiff = Header.BLOCK_INTERVAL_MS;
    const newDifficulty = prevDifficulty.mul(idealTimeDiff).div(prevTimeDiff);
    // prevent increase by more than 4x
    // prevent decrease by more than 1/4
    const maxIncrease = prevDifficulty.mul(new U64(4));
    const maxDecrease = prevDifficulty.div(new U64(4));
    if (newDifficulty.bn > maxIncrease.bn) {
      return maxIncrease;
    }
    if (newDifficulty.bn < maxDecrease.bn) {
      return maxDecrease;
    }
    if (newDifficulty.bn === 0n) {
      return new U64(1);
    }
    return newDifficulty;
  }

  static mintTxAmount(blockNum: U32): U64 {
    // shift every 210,000 blocks ("halving")
    const shiftBy = blockNum.bn / 210_000n;
    // BTC: 100_000_000 satoshis = 1 bitcoin
    // 100 bitcoins per block for the first 210,000 blocks
    // 100 million satoshis per block for the first 210,000 blocks
    // EBX: 100_000_000_000 adams = 1 earthbuck
    // 100 earthbucks per block for the first 210,000 blocks
    // 100 billion adams per block for the first 210,000 blocks
    return new U64((100n * 100_000_000_000n) >> shiftBy);
  }

  static difficultyFromTarget(target: U256): U64 {
    const maxTargetBuf = Header.MAX_TARGET_BYTES;
    const maxTarget = U256.fromBEBuf(maxTargetBuf.buf);
    return new U64(maxTarget.div(target).bn);
  }

  static targetFromDifficulty(difficulty: U64): U256 {
    const maxTargetBuf = Header.MAX_TARGET_BYTES;
    const maxTarget = U256.fromBEBuf(maxTargetBuf.buf);
    return maxTarget.div(new U256(difficulty.bn));
  }

  difficulty(): U64 {
    return Header.difficultyFromTarget(this.target);
  }

  workSerAlgoStr(): string {
    const str = WORK_SER_ALGO_NAME[this.workSerAlgo.n];
    if (!str) {
      throw new GenericError("unknown workSerAlgo");
    }
    return str;
  }

  workParAlgoStr(): string {
    const str = WORK_PAR_ALGO_NAME[this.workParAlgo.n];
    if (!str) {
      throw new GenericError("unknown workParAlgo");
    }
    return str;
  }

  addTx(merkleRoot: FixedBuf<32>, timestamp: U64 | null = null): Header {
    const nTransactions = new U64(this.nTransactions.bn + 1n);
    return new Header({
      ...this,
      nTransactions,
      rootMerkleNodeId: merkleRoot,
      timestamp: timestamp || this.timestamp,
    });
  }

  toWorkingHeader(): Header {
    const workingHeader = new Header({
      ...this,
      workSerHash: FixedBuf.alloc(32),
      workParHash: FixedBuf.alloc(32),
    });
    return workingHeader;
  }
}
