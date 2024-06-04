import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import * as Hash from "./hash.js";
import { SysBuf, FixedBuf } from "./ebx-buf.js";
import { U8, U16, U32, U64, U256 } from "./numbers.js";

export class Header {
  version: U8;
  prevBlockId: FixedBuf<32>;
  merkleRoot: FixedBuf<32>;
  timestamp: U64; // milliseconds
  blockNum: U32;
  target: U256;
  nonce: U256;
  workSerAlgo: U16;
  workSerHash: FixedBuf<32>;
  workParAlgo: U16;
  workParHash: FixedBuf<32>;

  // exactly two weeks if block interval is 10 minutes
  static readonly BLOCKS_PER_TARGET_ADJ_PERIOD = new U32(2016n);

  // 600_000 milliseconds = 600 seconds = 10 minutes
  static readonly BLOCK_INTERVAL = new U64(600_000);

  static readonly SIZE = 1 + 32 + 32 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32;
  static readonly MAX_TARGET = FixedBuf.alloc(32, 0xff);

  constructor(
    version: U8,
    prevBlockId: FixedBuf<32>,
    merkleRoot: FixedBuf<32>,
    timestamp: U64,
    blockNum: U32,
    target: U256,
    nonce: U256,
    workSerAlgo: U16,
    workSerHash: FixedBuf<32>,
    workParAlgo: U16,
    workParHash: FixedBuf<32>,
  ) {
    this.version = version;
    this.prevBlockId = prevBlockId;
    this.merkleRoot = merkleRoot;
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
    const previousBlockId = br.readFixed(32);
    const merkleRoot = br.readFixed(32);
    const timestamp = br.readU64BE();
    const blockNum = br.readU32BE();
    const target = br.readU256BE();
    const nonce = br.readU256BE();
    const workSerAlgo = br.readU16BE();
    const workSerHash = br.readFixed(32);
    const workParAlgo = br.readU16BE();
    const workParHash = br.readFixed(32);
    return new Header(
      version,
      previousBlockId,
      merkleRoot,
      timestamp,
      blockNum,
      target,
      nonce,
      workSerAlgo,
      workSerHash,
      workParAlgo,
      workParHash,
    );
  }

  toBufWriter(bw: BufWriter): BufWriter {
    bw.writeU8(this.version);
    bw.write(this.prevBlockId);
    bw.write(this.merkleRoot);
    bw.writeU64BE(this.timestamp);
    bw.writeU32BE(this.blockNum);
    bw.writeU256BE(this.target);
    bw.writeU256BE(this.nonce);
    bw.writeU16BE(this.workSerAlgo);
    bw.write(this.workSerHash);
    bw.writeU16BE(this.workParAlgo);
    bw.write(this.workParHash);
    return bw;
  }

  toStrictHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromStrictHex(str: string): Header {
    return Header.fromBuf(SysBuf.from(str, "hex"));
  }

  toStrictStr(): string {
    return this.toStrictHex();
  }

  static fromStrictStr(str: string): Header {
    return Header.fromStrictHex(str);
  }

  static fromGenesis(initialTarget: U256): Header {
    const timestamp = new U64(Math.floor(Date.now())); // milliseconds
    return new Header(
      new U8(0),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      timestamp,
      new U32(0n),
      initialTarget,
      new U256(0),
      new U16(0),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
    );
  }

  static isValidVersion(version: U8): boolean {
    return version.n === 0;
  }

  static isValidPreviousBlockHash(previousBlockHash: SysBuf): boolean {
    return previousBlockHash.length === 32;
  }

  static isValidMerkleRoot(merkleRoot: SysBuf): boolean {
    return merkleRoot.length === 32;
  }

  static isValidNonce(nonce: U256): boolean {
    return true;
  }

  static isValidTarget(target: U256): boolean {
    // TODO: Fix this
    return true;
  }

  isValid(): boolean {
    const len = this.toBuf().length;
    if (len !== Header.SIZE) {
      return false;
    }
    return (
      Header.isValidVersion(this.version) &&
      Header.isValidPreviousBlockHash(this.prevBlockId) &&
      Header.isValidMerkleRoot(this.merkleRoot) &&
      Header.isValidNonce(this.nonce) &&
      Header.isValidTarget(this.target)
    );
  }

  isGenesis(): boolean {
    return (
      this.blockNum.bn === 0n && this.prevBlockId.every((byte) => byte === 0)
    );
  }

  hash(): FixedBuf<32> {
    return Hash.blake3Hash(this.toBuf());
  }

  id(): FixedBuf<32> {
    return Hash.doubleBlake3Hash(this.toBuf());
  }

  // static newTargetFromOldTargets(
  //   targetSum: bigint,
  //   realTimeDiff: U64,
  //   len: U32,
  // ): bigint

  static coinbaseAmount(blockNum: U32): U64 {
    // shift every 210,000 blocks ("halving")
    const shiftBy = blockNum.bn / 210_000n;
    // 100_000_000 satoshis = 1 earthbuck
    // 100 earthbucks per block for the first 210,000 blocks
    return new U64((100n * 100_000_000n) >> shiftBy);
  }
}
