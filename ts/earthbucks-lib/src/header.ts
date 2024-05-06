import IsoBufReader from "./iso-buf-reader";
import IsoBufWriter from "./iso-buf-writer";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

export default class Header {
  static readonly BLOCKS_PER_ADJUSTMENT = 2016n;
  static readonly BLOCK_INTERVAL = 600n; // seconds
  static readonly BLOCK_HEADER_SIZE = 220;
  static readonly INITIAL_TARGET = Buffer.alloc(32, 0xff);

  version: number; // uint32
  prevBlockId: Buffer; // 256 bits
  merkleRoot: Buffer; // 256 bits
  timestamp: bigint; // uint64
  blockNum: bigint; // uint64
  target: Buffer; // 256 bits
  nonce: Buffer; // 256 bits
  workAlgo: bigint; // uint64
  workSer: Buffer; // 256 bits
  workPar: Buffer; // 256 bits

  constructor(
    version: number,
    prevBlockId: Buffer,
    merkleRoot: Buffer,
    timestamp: bigint,
    blockNum: bigint,
    target: Buffer,
    nonce: Buffer,
    workAlgo: bigint,
    workSer: Buffer,
    workPar: Buffer,
  ) {
    this.version = version;
    this.prevBlockId = prevBlockId;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp;
    this.blockNum = blockNum;
    this.target = target;
    this.nonce = nonce;
    this.workAlgo = workAlgo;
    this.workSer = workSer;
    this.workPar = workPar;
  }

  toIsoBuf(): Buffer {
    const bw = new IsoBufWriter();
    bw.writeUInt32BE(this.version);
    bw.writeBuffer(this.prevBlockId);
    bw.writeBuffer(this.merkleRoot);
    bw.writeUInt64BEBigInt(this.timestamp);
    bw.writeUInt64BEBigInt(this.blockNum);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt64BEBigInt(this.workAlgo);
    bw.writeBuffer(this.workSer);
    bw.writeBuffer(this.workPar);
    return bw.toIsoBuf();
  }

  static fromIsoBuf(buf: Buffer): Header {
    const br = new IsoBufReader(buf);
    const version = br.readUInt32BE();
    const previousBlockHash = br.readBuffer(32);
    const merkleRoot = br.readBuffer(32);
    const timestamp = br.readUInt64BEBigInt();
    const blockNum = br.readUInt64BEBigInt();
    const target = br.readBuffer(32);
    const nonce = br.readBuffer(32);
    const workAlgo = br.readUInt64BEBigInt();
    const workSer = br.readBuffer(32);
    const workPar = br.readBuffer(32);
    return new Header(
      version,
      previousBlockHash,
      merkleRoot,
      timestamp,
      blockNum,
      target,
      nonce,
      workAlgo,
      workSer,
      workPar,
    );
  }

  static fromIsoBufReader(br: IsoBufReader): Header {
    const version = br.readUInt32BE();
    const previousBlockHash = br.readBuffer(32);
    const merkleRoot = br.readBuffer(32);
    const timestamp = br.readUInt64BEBigInt();
    const blockNum = br.readUInt64BEBigInt();
    const target = br.readBuffer(32);
    const nonce = br.readBuffer(32);
    const workAlgo = br.readUInt64BEBigInt();
    const workSer = br.readBuffer(32);
    const workPar = br.readBuffer(32);
    return new Header(
      version,
      previousBlockHash,
      merkleRoot,
      timestamp,
      blockNum,
      target,
      nonce,
      workAlgo,
      workSer,
      workPar,
    );
  }

  toIsoBufWriter(bw: IsoBufWriter): IsoBufWriter {
    bw.writeUInt32BE(this.version);
    bw.writeBuffer(this.prevBlockId);
    bw.writeBuffer(this.merkleRoot);
    bw.writeUInt64BEBigInt(this.timestamp);
    bw.writeUInt64BEBigInt(this.blockNum);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt64BEBigInt(this.workAlgo);
    bw.writeBuffer(this.workSer);
    bw.writeBuffer(this.workPar);
    return bw;
  }

  toIsoStr(): string {
    return this.toIsoBuf().toString("hex");
  }

  static fromIsoStr(str: string): Header {
    return Header.fromIsoBuf(Buffer.from(str, "hex"));
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
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
  }

  static fromPrevBlockHeader(
    prevBlockHeader: Header,
    prevAdjustmentBlockHeader: Header | null,
  ): Header {
    let target = null;
    const blockNum = prevBlockHeader.blockNum + 1n;
    if (blockNum % Header.BLOCKS_PER_ADJUSTMENT === 0n) {
      if (
        !prevAdjustmentBlockHeader ||
        prevAdjustmentBlockHeader.blockNum + Header.BLOCKS_PER_ADJUSTMENT !==
          blockNum
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
    const workAlgo = prevBlockHeader.workAlgo;
    const workSer = Buffer.alloc(32);
    const workPar = Buffer.alloc(32);
    return new Header(
      1,
      prevBlockId,
      Buffer.alloc(32),
      timestamp,
      blockNum,
      target,
      nonce,
      workAlgo,
      workSer,
      workPar,
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
    return blake3Hash(this.toIsoBuf());
  }

  id(): Buffer {
    return doubleBlake3Hash(this.toIsoBuf());
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
