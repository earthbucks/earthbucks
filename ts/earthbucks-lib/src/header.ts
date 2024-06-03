import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import * as Hash from "./hash.js";
import { SysBuf, FixedEbxBuf } from "./ebx-buf.js";
import { U8, U16, U32, U64, U256 } from "./numbers.js";
import { GenericError } from "./ebx-error.js";

export class Header {
  version: U32;
  prevBlockId: FixedEbxBuf<32>;
  merkleRoot: FixedEbxBuf<32>;
  timestamp: U64; // seconds
  blockNum: U64;
  target: FixedEbxBuf<32>;
  nonce: FixedEbxBuf<32>;
  workSerAlgo: U32;
  workSerHash: FixedEbxBuf<32>;
  workParAlgo: U32;
  workParHash: FixedEbxBuf<32>;

  static readonly BLOCKS_PER_TARGET_ADJ_PERIOD = new U64(2016n);
  static readonly BLOCK_INTERVAL = new U64(600n); // seconds
  static readonly BLOCK_HEADER_SIZE = 220;
  static readonly INITIAL_TARGET = FixedEbxBuf.alloc(32, 0xff);

  constructor(
    version: U32,
    prevBlockId: FixedEbxBuf<32>,
    merkleRoot: FixedEbxBuf<32>,
    timestamp: U64,
    blockNum: U64,
    target: FixedEbxBuf<32>,
    nonce: FixedEbxBuf<32>,
    workSerAlgo: U32,
    workSerHash: FixedEbxBuf<32>,
    workParAlgo: U32,
    workParHash: FixedEbxBuf<32>,
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

  toEbxBuf(): SysBuf {
    const bw = new BufWriter();
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
    return bw.toSysBuf();
  }

  static fromEbxBuf(buf: SysBuf): Header {
    return Header.fromEbxBufReader(new BufReader(buf));
  }

  static fromEbxBufReader(br: BufReader): Header {
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

  toEbxBufWriter(bw: BufWriter): BufWriter {
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
    return this.toEbxBuf().toString("hex");
  }

  static fromIsoHex(str: string): Header {
    return Header.fromEbxBuf(SysBuf.from(str, "hex"));
  }

  toIsoString(): string {
    return this.toIsoHex();
  }

  static fromIsoString(str: string): Header {
    return Header.fromIsoHex(str);
  }

  static fromGenesis(initialTarget: FixedEbxBuf<32>): Header {
    const timestamp = new U64(Math.floor(Date.now() / 1000)); // seconds
    return new Header(
      new U32(1),
      FixedEbxBuf.alloc(32),
      FixedEbxBuf.alloc(32),
      timestamp,
      new U64(0n),
      initialTarget,
      FixedEbxBuf.alloc(32),
      new U32(0),
      FixedEbxBuf.alloc(32),
      new U32(0),
      FixedEbxBuf.alloc(32),
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
    const nonce = FixedEbxBuf.alloc(32);
    const workSerAlgo = prevBlockHeader.workSerAlgo;
    const workSerHash = FixedEbxBuf.alloc(32);
    const workParAlgo = prevBlockHeader.workParAlgo;
    const workParHash = FixedEbxBuf.alloc(32);
    return new Header(
      new U32(1),
      prevBlockId,
      FixedEbxBuf.alloc(32),
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
    const len = this.toEbxBuf().length;
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

  hash(): FixedEbxBuf<32> {
    return Hash.blake3Hash(this.toEbxBuf());
  }

  id(): FixedEbxBuf<32> {
    return Hash.doubleBlake3Hash(this.toEbxBuf());
  }

  static adjustTarget(targetBuf: SysBuf, timeDiff: U64): FixedEbxBuf<32> {
    const target = new BufReader(targetBuf).readU256BE().bn;
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

    const newTargetBuf = new BufWriter()
      .writeU256BE(new U256(newTarget))
      .toSysBuf();
    return FixedEbxBuf.fromBuf(32, newTargetBuf);
  }
}
