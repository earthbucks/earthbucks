import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import * as Hash from "./hash.js";
import { SysBuf, FixedBuf } from "./buf.js";
import { U8, U16, U32, U64, U256 } from "./numbers.js";
import { GenericError } from "./error.js";

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
  static readonly MAX_TARGET_BYTES = FixedBuf.alloc(32, 0xff);

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
    bw.write(this.prevBlockId.buf);
    bw.write(this.merkleRoot.buf);
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

  isTargetValid(lch: Header[]): boolean {
    let newTarget: U256;
    try {
      newTarget = Header.newTargetFromLch(lch, this.timestamp);
    } catch (e) {
      return false;
    }
    return this.target.bn === newTarget.bn;
  }

  isIdValid(): boolean {
    const id = this.id();
    const idNum = new BufReader(id.buf).readU256BE();
    return idNum.bn < this.target.bn;
  }

  isVersionValid(): boolean {
    return this.version.n === 0;
  }

  isTimestampValidAt(timestamp: U64): boolean {
    return this.timestamp.n <= timestamp.n;
  }

  isValidInLch(lch: Header[]): boolean {
    if (!this.isVersionValid()) {
      return false;
    }
    if (this.blockNum.bn === 0n) {
      return this.isGenesis();
    }
    if (lch.length === 0) {
      return false;
    }
    if (this.blockNum.n !== lch.length) {
      return false;
    }
    if (this.prevBlockId !== lch[lch.length - 1].id()) {
      return false;
    }
    if (this.timestamp.n <= lch[lch.length - 1].timestamp.n) {
      return false;
    }
    if (!this.isTargetValid(lch)) {
      return false;
    }
    if (!this.isIdValid()) {
      return false;
    }
    return true;
  }

  isValidAt(lch: Header[], timestamp: U64): boolean {
    return this.isTimestampValidAt(timestamp) && this.isValidInLch(lch);
  }

  isValidNow(lch: Header[]): boolean {
    return this.isValidAt(lch, Header.getNewTimestamp());
  }

  isGenesis(): boolean {
    return (
      this.blockNum.bn === 0n &&
      this.prevBlockId.buf.every((byte) => byte === 0)
    );
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

  hash(): FixedBuf<32> {
    return Hash.blake3Hash(this.toBuf());
  }

  id(): FixedBuf<32> {
    return Hash.doubleBlake3Hash(this.toBuf());
  }

  static getNewTimestamp(): U64 {
    return new U64(Math.floor(Date.now()));
  }

  static fromLch(lch: Header[], newTimestamp: U64): Header {
    if (lch.length === 0) {
      return Header.fromGenesis(new U256(0));
    }
    const newTarget = Header.newTargetFromLch(lch, newTimestamp);
    const prevBlock = lch[lch.length - 1];
    const prevBlockId = prevBlock.id();
    const blockNum = new U32(lch.length);
    const timestamp = newTimestamp;
    const nonce = new U256(0);
    const workSerAlgo = prevBlock.workSerAlgo;
    const workSerHash = FixedBuf.alloc(32);
    const workParAlgo = prevBlock.workParAlgo;
    const workParHash = FixedBuf.alloc(32);
    return new Header(
      new U8(0),
      prevBlockId,
      FixedBuf.alloc(32),
      timestamp,
      blockNum,
      newTarget,
      nonce,
      workSerAlgo,
      workSerHash,
      workParAlgo,
      workParHash,
    );
  }

  static newTargetFromLch(lch: Header[], newTimestamp: U64): U256 {
    let adjh: Header[];
    if (lch.length > Header.BLOCKS_PER_TARGET_ADJ_PERIOD.n) {
      adjh = lch.slice(lch.length - Header.BLOCKS_PER_TARGET_ADJ_PERIOD.n);
    } else {
      adjh = lch;
    }
    const len = new U32(adjh.length);
    if (len.n === 0) {
      return new BufReader(Header.MAX_TARGET_BYTES.buf).readU256BE();
    }
    const firstHeader = adjh[0];
    const targets: bigint[] = [];
    for (const header of adjh) {
      const target = header.target.bn;
      targets.push(target);
    }
    const targetSum = targets.reduce((a, b) => a + b);
    if (newTimestamp <= firstHeader.timestamp) {
      throw new GenericError("timestamps must be increasing");
    }
    const realTimeDiff = newTimestamp.sub(firstHeader.timestamp);
    return Header.newTargetFromOldTargets(targetSum, realTimeDiff, len);
  }

  static newTargetFromOldTargets(
    targetSum: bigint,
    realTimeDiff: U64,
    len: U32,
  ): U256 {
    // - target_sum is sum of all targets in the adjustment period
    // - real_time_diff is the time difference between the first block in
    //   the adjustment period and now (the new block)
    // new target = average target * real time diff / intended time diff
    // let new_target = (target_sum / len) * real_time_diff / intended_time_diff;
    // let new_target = (target_sum * real_time_diff) / intended_time_diff / len;
    // let new_target = (target_sum * real_time_diff) / len / intended_time_diff;
    // let new_target = (target_sum * real_time_diff) / (len * intended_time_diff);
    // the fewest divisions is the most accurate in integer arithmetic...
    const intendedTimeDiff = len.bn * Header.BLOCK_INTERVAL.bn;
    const resBigInt =
      (targetSum * realTimeDiff.bn) / (len.bn * intendedTimeDiff);
    return new U256(resBigInt);
  }

  static coinbaseAmount(blockNum: U32): U64 {
    // shift every 210,000 blocks ("halving")
    const shiftBy = blockNum.bn / 210_000n;
    // 100_000_000 satoshis = 1 earthbuck
    // 100 earthbucks per block for the first 210,000 blocks
    return new U64((100n * 100_000_000n) >> shiftBy);
  }
}
