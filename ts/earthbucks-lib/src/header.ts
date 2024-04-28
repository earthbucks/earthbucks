import BufferReader from "./buffer-reader";
import BufferWriter from "./buffer-writer";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

export default class Header {
  static readonly BLOCKS_PER_ADJUSTMENT = 2016n;
  static readonly BLOCK_INTERVAL = 600n; // seconds

  version: number; // uint32
  prevBlockId: Buffer; // 256 bits
  merkleRoot: Buffer; // 256 bits
  timestamp: bigint; // uint64
  target: Buffer; // 256 bits
  nonce: Buffer; // 256 bits
  nBlock: bigint; // uint64

  constructor(
    version: number,
    prevBlockId: Buffer,
    merkleRoot: Buffer,
    timestamp: bigint,
    target: Buffer,
    nonce: Buffer,
    nBlock: bigint,
  ) {
    this.version = version;
    this.prevBlockId = prevBlockId;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp;
    this.target = target;
    this.nonce = nonce;
    this.nBlock = nBlock;
  }

  toBuffer(): Buffer {
    const bw = new BufferWriter();
    bw.writeUInt32BE(this.version);
    bw.writeBuffer(this.prevBlockId);
    bw.writeBuffer(this.merkleRoot);
    bw.writeUInt64BEBigInt(this.timestamp);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt64BEBigInt(this.nBlock);
    return bw.toBuffer();
  }

  static fromBuffer(buf: Buffer): Header {
    const br = new BufferReader(buf);
    const version = br.readUInt32BE();
    const previousBlockHash = br.readBuffer(32);
    const merkleRoot = br.readBuffer(32);
    const timestamp = br.readUInt64BEBigInt();
    const target = br.readBuffer(32);
    const nonce = br.readBuffer(32);
    const index = br.readUInt64BEBigInt();
    return new Header(
      version,
      previousBlockHash,
      merkleRoot,
      timestamp,
      target,
      nonce,
      index,
    );
  }

  static fromBufferReader(br: BufferReader): Header {
    const version = br.readUInt32BE();
    const previousBlockHash = br.readBuffer(32);
    const merkleRoot = br.readBuffer(32);
    const timestamp = br.readUInt64BEBigInt();
    const target = br.readBuffer(32);
    const nonce = br.readBuffer(32);
    const index = br.readUInt64BEBigInt();
    return new Header(
      version,
      previousBlockHash,
      merkleRoot,
      timestamp,
      target,
      nonce,
      index,
    );
  }

  toBufferWriter(bw: BufferWriter): BufferWriter {
    bw.writeUInt32BE(this.version);
    bw.writeBuffer(this.prevBlockId);
    bw.writeBuffer(this.merkleRoot);
    bw.writeUInt64BEBigInt(this.timestamp);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt64BEBigInt(this.nBlock);
    return bw;
  }

  toString(): string {
    return this.toBuffer().toString("hex");
  }

  static fromString(str: string): Header {
    return Header.fromBuffer(Buffer.from(str, "hex"));
  }

  static fromGenesis(initialTarget: Buffer): Header {
    const timestamp = BigInt(Math.floor(Date.now() / 1000)); // seconds
    return new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      timestamp,
      initialTarget,
      Buffer.alloc(32),
      0n,
    );
  }

  static fromPrevBlockHeader(
    prevBlockHeader: Header,
    prevAdjustmentBlockHeader: Header | null,
  ): Header {
    let target = null;
    const index = prevBlockHeader.nBlock + 1n;
    if (index % Header.BLOCKS_PER_ADJUSTMENT === 0n) {
      if (
        !prevAdjustmentBlockHeader ||
        prevAdjustmentBlockHeader.nBlock + Header.BLOCKS_PER_ADJUSTMENT !==
          index
      ) {
        throw new Error(
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
    return new Header(
      1,
      prevBlockId,
      Buffer.alloc(32),
      timestamp,
      target,
      nonce,
      index,
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
    const len = this.toBuffer().length;
    if (len !== 148) {
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
    return this.nBlock === 0n && this.prevBlockId.every((byte) => byte === 0);
  }

  hash(): Buffer {
    return blake3Hash(this.toBuffer());
  }

  id(): Buffer {
    return doubleBlake3Hash(this.toBuffer());
  }

  static adjustTarget(targetBuf: Buffer, timeDiff: bigint): Buffer {
    const target = BigInt("0x" + Buffer.from(targetBuf).toString("hex"));
    const twoWeeks = Header.BLOCKS_PER_ADJUSTMENT * Header.BLOCK_INTERVAL;

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
