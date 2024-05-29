import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import * as Hash from "./hash.js";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "earthbucks-opt-res";

export class Header {
  static readonly BLOCKS_PER_TARGET_ADJ_PERIOD = 2016n;
  static readonly BLOCK_INTERVAL = 600n; // seconds
  static readonly BLOCK_HEADER_SIZE = 220;
  static readonly INITIAL_TARGET = Buffer.alloc(32, 0xff);

  version: number;
  prevBlockId: Buffer;
  merkleRoot: Buffer;
  timestamp: bigint;
  blockNum: bigint;
  target: Buffer;
  nonce: Buffer;
  workSerAlgo: number;
  workSerHash: Buffer;
  workParAlgo: number;
  workParHash: Buffer;

  constructor(
    version: number,
    prevBlockId: Buffer,
    merkleRoot: Buffer,
    timestamp: bigint,
    blockNum: bigint,
    target: Buffer,
    nonce: Buffer,
    workSerAlgo: number,
    workSerHash: Buffer,
    workParAlgo: number,
    workParHash: Buffer,
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

  toIsoBuf(): Buffer {
    const bw = new IsoBufWriter();
    bw.writeUInt32BE(this.version);
    bw.writeBuffer(this.prevBlockId);
    bw.writeBuffer(this.merkleRoot);
    bw.writeUInt64BE(this.timestamp);
    bw.writeUInt64BE(this.blockNum);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt32BE(this.workSerAlgo);
    bw.writeBuffer(this.workSerHash);
    bw.writeUInt32BE(this.workParAlgo);
    bw.writeBuffer(this.workParHash);
    return bw.toIsoBuf();
  }

  static fromIsoBuf(buf: Buffer): Result<Header, string> {
    return Header.fromIsoBufReader(new IsoBufReader(buf));
  }

  static fromIsoBufReader(br: IsoBufReader): Result<Header, string> {
    const versionRes = br
      .readU32BE()
      .mapErr((err) => `Could not read version number: ${err}`);
    if (versionRes.err) {
      return versionRes;
    }
    const version = versionRes.unwrap();
    const previousBlockHashRes = br
      .read(32)
      .mapErr((err) => `Could not read previous block hash: ${err}`);
    if (previousBlockHashRes.err) {
      return previousBlockHashRes;
    }
    const previousBlockHash = previousBlockHashRes.unwrap();
    const merkleRootRes = br
      .read(32)
      .mapErr((err) => `Could not read merkle root: ${err}`);
    if (merkleRootRes.err) {
      return merkleRootRes;
    }
    const merkleRoot = merkleRootRes.unwrap();
    const timestampRes = br
      .readU64BE()
      .mapErr((err) => `Could not read timestamp: ${err}`);
    if (timestampRes.err) {
      return timestampRes;
    }
    const timestamp = timestampRes.unwrap();
    const blockNumRes = br
      .readU64BE()
      .mapErr((err) => `Could not read block number: ${err}`);
    if (blockNumRes.err) {
      return blockNumRes;
    }
    const blockNum = blockNumRes.unwrap();
    const targetRes = br
      .read(32)
      .mapErr((err) => `Could not read target: ${err}`);
    if (targetRes.err) {
      return targetRes;
    }
    const target = targetRes.unwrap();
    const nonceRes = br
      .read(32)
      .mapErr((err) => `Could not read nonce: ${err}`);
    if (nonceRes.err) {
      return nonceRes;
    }
    const nonce = nonceRes.unwrap();
    const workSerAlgoRes = br
      .readU32BE()
      .mapErr((err) => `Could not read work algorithm: ${err}`);
    if (workSerAlgoRes.err) {
      return workSerAlgoRes;
    }
    const workSerAlgo = workSerAlgoRes.unwrap();
    const workSerHashRes = br
      .read(32)
      .mapErr((err) => `Could not read serial work: ${err}`);
    if (workSerHashRes.err) {
      return workSerHashRes;
    }
    const workSerHash = workSerHashRes.unwrap();
    const workParAlgoRes = br
      .readU32BE()
      .mapErr((err) => `Could not read work algorithm: ${err}`);
    if (workParAlgoRes.err) {
      return workParAlgoRes;
    }
    const workParAlgo = workParAlgoRes.unwrap();
    const workParHashRes = br
      .read(32)
      .mapErr((err) => `Could not read parallel work: ${err}`);
    if (workParHashRes.err) {
      return workParHashRes;
    }
    const workParHash = workParHashRes.unwrap();
    return Ok(
      new Header(
        version,
        previousBlockHash,
        merkleRoot,
        timestamp,
        blockNum,
        target,
        nonce,
        workSerAlgo,
        workSerHash,
        workParAlgo,
        workParHash,
      ),
    );
  }

  toIsoBufWriter(bw: IsoBufWriter): IsoBufWriter {
    bw.writeUInt32BE(this.version);
    bw.writeBuffer(this.prevBlockId);
    bw.writeBuffer(this.merkleRoot);
    bw.writeUInt64BE(this.timestamp);
    bw.writeUInt64BE(this.blockNum);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt32BE(this.workSerAlgo);
    bw.writeBuffer(this.workSerHash);
    bw.writeUInt32BE(this.workParAlgo);
    bw.writeBuffer(this.workParHash);
    return bw;
  }

  toIsoHex(): string {
    return this.toIsoBuf().toString("hex");
  }

  static fromIsoHex(str: string): Result<Header, string> {
    return Header.fromIsoBuf(Buffer.from(str, "hex"));
  }

  toIsoString(): string {
    return this.toIsoHex();
  }

  static fromIsoString(str: string): Result<Header, string> {
    return Header.fromIsoHex(str);
  }

  static fromGenesis(initialTarget: Buffer): Header {
    const timestamp = BigInt(Math.floor(Date.now() / 1000)); // seconds
    return new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      timestamp,
      0n,
      initialTarget,
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
    );
  }

  static fromPrevBlockHeader(
    prevBlockHeader: Header,
    prevAdjustmentBlockHeader: Header | null,
  ): Result<Header, string> {
    let target = null;
    const blockNum = prevBlockHeader.blockNum + 1n;
    if (blockNum % Header.BLOCKS_PER_TARGET_ADJ_PERIOD === 0n) {
      if (
        !prevAdjustmentBlockHeader ||
        prevAdjustmentBlockHeader.blockNum +
          Header.BLOCKS_PER_TARGET_ADJ_PERIOD !==
          blockNum
      ) {
        return Err(
          "must provide previous adjustment block header 2016 blocks before",
        );
      }
      const timeDiff =
        prevBlockHeader.timestamp - prevAdjustmentBlockHeader!.timestamp;
      const prevTarget = prevBlockHeader.target;
      target = Header.adjustTarget(prevTarget, timeDiff);
    } else {
      target = prevBlockHeader.target;
    }
    const prevBlockId = prevBlockHeader.id();
    const timestamp = BigInt(Math.floor(Date.now() / 1000)); // seconds
    const nonce = Buffer.alloc(32);
    const workSerAlgo = prevBlockHeader.workSerAlgo;
    const workSerHash = Buffer.alloc(32);
    const workParAlgo = prevBlockHeader.workParAlgo;
    const workParHash = Buffer.alloc(32);
    return Ok(
      new Header(
        1,
        prevBlockId,
        Buffer.alloc(32),
        timestamp,
        blockNum,
        target,
        nonce,
        workSerAlgo,
        workSerHash,
        workParAlgo,
        workParHash,
      ),
    );
  }

  static isValidVersion(version: number): boolean {
    return version === 1;
  }

  static isValidPreviousBlockHash(previousBlockHash: Buffer): boolean {
    return previousBlockHash.length === 32;
  }

  static isValidMerkleRoot(merkleRoot: Buffer): boolean {
    return merkleRoot.length === 32;
  }

  static isValidNonce(nonce: Buffer): boolean {
    return nonce.length === 32;
  }

  static isValidTarget(target: Buffer): boolean {
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
    return this.blockNum === 0n && this.prevBlockId.every((byte) => byte === 0);
  }

  hash(): Buffer {
    return Hash.blake3Hash(this.toIsoBuf());
  }

  id(): Buffer {
    return Hash.doubleBlake3Hash(this.toIsoBuf());
  }

  static adjustTarget(targetBuf: Buffer, timeDiff: bigint): Buffer {
    const target = BigInt("0x" + Buffer.from(targetBuf).toString("hex"));
    const twoWeeks =
      Header.BLOCKS_PER_TARGET_ADJ_PERIOD * Header.BLOCK_INTERVAL;

    // To prevent extreme difficulty adjustments, if it took less than 1 week or
    // more than 8 weeks, we still consider it as 1 week or 8 weeks
    // respectively.
    if (timeDiff < twoWeeks / 2n) {
      timeDiff = twoWeeks / 2n; // seconds
    }
    if (timeDiff > twoWeeks * 2n) {
      timeDiff = twoWeeks * 2n; // seconds
    }

    const newTarget = (target * timeDiff) / twoWeeks; // seconds

    const newTargetBuf = Buffer.from(
      newTarget.toString(16).padStart(64, "0"),
      "hex",
    );
    return newTargetBuf;
  }
}
