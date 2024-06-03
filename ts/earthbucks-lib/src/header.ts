import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import * as Hash from "./hash.js";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import { GenericError } from "./ebx-error.js";

export class Header {
  static readonly BLOCKS_PER_TARGET_ADJ_PERIOD = new U64(2016n);
  static readonly BLOCK_INTERVAL = new U64(600n); // seconds
  static readonly BLOCK_HEADER_SIZE = 220;
  static readonly INITIAL_TARGET = FixedIsoBuf.alloc(32, 0xff);

  version: U32;
  prevBlockId: FixedIsoBuf<32>;
  merkleRoot: FixedIsoBuf<32>;
  timestamp: U64; // seconds
  blockNum: U64;
  target: FixedIsoBuf<32>;
  nonce: FixedIsoBuf<32>;
  workSerAlgo: U32;
  workSerHash: FixedIsoBuf<32>;
  workParAlgo: U32;
  workParHash: FixedIsoBuf<32>;

  constructor(
    version: U32,
    prevBlockId: FixedIsoBuf<32>,
    merkleRoot: FixedIsoBuf<32>,
    timestamp: U64,
    blockNum: U64,
    target: FixedIsoBuf<32>,
    nonce: FixedIsoBuf<32>,
    workSerAlgo: U32,
    workSerHash: FixedIsoBuf<32>,
    workParAlgo: U32,
    workParHash: FixedIsoBuf<32>,
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

  toIsoBuf(): SysBuf {
    const bw = new IsoBufWriter();
    bw.writeU32BE(this.version);
    bw.write(this.prevBlockId);
    bw.write(this.merkleRoot);
    bw.writeU64BE(this.timestamp);
    bw.writeU64BE(this.blockNum);
    bw.write(this.target);
    bw.write(this.nonce);
    bw.writeU32BE(this.workSerAlgo);
    bw.write(this.workSerHash);
    bw.writeU32BE(this.workParAlgo);
    bw.write(this.workParHash);
    return bw.toIsoBuf();
  }

  static fromIsoBuf(buf: SysBuf): Header {
    return Header.fromIsoBufReader(new IsoBufReader(buf));
  }

  static fromIsoBufReader(br: IsoBufReader): Header {
    const version = br.readU32BE();
    const previousBlockId = br.readFixed<32>(32);
    const merkleRoot = br.readFixed(32);
    const timestamp = br.readU64BE();
    const blockNum = br.readU64BE();
    const target = br.readFixed(32);
    const nonce = br.readFixed(32);
    const workSerAlgo = br.readU32BE();
    const workSerHash = br.readFixed(32);
    const workParAlgo = br.readU32BE();
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

  toIsoBufWriter(bw: IsoBufWriter): IsoBufWriter {
    bw.writeU32BE(this.version);
    bw.write(this.prevBlockId);
    bw.write(this.merkleRoot);
    bw.writeU64BE(this.timestamp);
    bw.writeU64BE(this.blockNum);
    bw.write(this.target);
    bw.write(this.nonce);
    bw.writeU32BE(this.workSerAlgo);
    bw.write(this.workSerHash);
    bw.writeU32BE(this.workParAlgo);
    bw.write(this.workParHash);
    return bw;
  }

  toIsoHex(): string {
    return this.toIsoBuf().toString("hex");
  }

  static fromIsoHex(str: string): Header {
    return Header.fromIsoBuf(SysBuf.from(str, "hex"));
  }

  toIsoString(): string {
    return this.toIsoHex();
  }

  static fromIsoString(str: string): Header {
    return Header.fromIsoHex(str);
  }

  static fromGenesis(initialTarget: FixedIsoBuf<32>): Header {
    const timestamp = new U64(Math.floor(Date.now() / 1000)); // seconds
    return new Header(
      new U32(1),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      timestamp,
      new U64(0n),
      initialTarget,
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
    );
  }

  static fromPrevBlockHeader(
    prevBlockHeader: Header,
    prevAdjustmentBlockHeader: Header | null,
  ): Header {
    let target = null;
    const blockNum = prevBlockHeader.blockNum.add(new U64(1n));
    if (blockNum.bn % Header.BLOCKS_PER_TARGET_ADJ_PERIOD.bn === 0n) {
      if (
        !prevAdjustmentBlockHeader ||
        prevAdjustmentBlockHeader.blockNum.add(
          Header.BLOCKS_PER_TARGET_ADJ_PERIOD,
        ).bn !== blockNum.bn
      ) {
        throw new GenericError(
          "must provide previous adjustment block header 2016 blocks before",
        );
      }
      const timeDiff: U64 = prevBlockHeader.timestamp.sub(
        prevAdjustmentBlockHeader!.timestamp,
      );
      const prevTarget = prevBlockHeader.target;
      target = Header.adjustTarget(prevTarget, timeDiff);
    } else {
      target = prevBlockHeader.target;
    }
    const prevBlockId = prevBlockHeader.id();
    const timestamp = new U64(BigInt(Math.floor(Date.now() / 1000))); // seconds
    const nonce = FixedIsoBuf.alloc(32);
    const workSerAlgo = prevBlockHeader.workSerAlgo;
    const workSerHash = FixedIsoBuf.alloc(32);
    const workParAlgo = prevBlockHeader.workParAlgo;
    const workParHash = FixedIsoBuf.alloc(32);
    return new Header(
      new U32(1),
      prevBlockId,
      FixedIsoBuf.alloc(32),
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

  static isValidVersion(version: U32): boolean {
    return version.n === 1;
  }

  static isValidPreviousBlockHash(previousBlockHash: SysBuf): boolean {
    return previousBlockHash.length === 32;
  }

  static isValidMerkleRoot(merkleRoot: SysBuf): boolean {
    return merkleRoot.length === 32;
  }

  static isValidNonce(nonce: SysBuf): boolean {
    return nonce.length === 32;
  }

  static isValidTarget(target: SysBuf): boolean {
    return target.length === 32;
  }

  isValid(): boolean {
    const len = this.toIsoBuf().length;
    if (len !== Header.BLOCK_HEADER_SIZE) {
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

  hash(): FixedIsoBuf<32> {
    return Hash.blake3Hash(this.toIsoBuf());
  }

  id(): FixedIsoBuf<32> {
    return Hash.doubleBlake3Hash(this.toIsoBuf());
  }

  static adjustTarget(targetBuf: SysBuf, timeDiff: U64): FixedIsoBuf<32> {
    const target = BigInt("0x" + SysBuf.from(targetBuf).toString("hex"));
    const twoWeeks: bigint = Header.BLOCKS_PER_TARGET_ADJ_PERIOD.mul(
      Header.BLOCK_INTERVAL,
    ).bn;

    // To prevent extreme difficulty adjustments, if it took less than 1 week or
    // more than 8 weeks, we still consider it as 1 week or 8 weeks
    // respectively.
    if (timeDiff.bn < twoWeeks / 2n) {
      timeDiff = new U64(twoWeeks / 2n); // seconds
    }
    if (timeDiff.bn > twoWeeks * 2n) {
      timeDiff = new U64(twoWeeks * 2n); // seconds
    }

    const newTarget = (target * timeDiff.bn) / twoWeeks; // seconds

    const newTargetBuf = SysBuf.from(
      newTarget.toString(16).padStart(64, "0"),
      "hex",
    );
    return FixedIsoBuf.fromBuf(32, newTargetBuf);
  }
}
