import IsoBufReader from "./iso-buf-reader";
import IsoBufWriter from "./iso-buf-writer";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "ts-results";

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
    bw.writeUInt64BE(this.timestamp);
    bw.writeUInt64BE(this.blockNum);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt64BE(this.workAlgo);
    bw.writeBuffer(this.workSer);
    bw.writeBuffer(this.workPar);
    return bw.toIsoBuf();
  }

  static fromIsoBuf(buf: Buffer): Result<Header, string> {
    return Header.fromIsoBufReader(new IsoBufReader(buf));
  }

  static fromIsoBufReader(br: IsoBufReader): Result<Header, string> {
    try {
      const version = br
        .readUInt32BE()
        .mapErr((err) => `Could not read version number: ${err}`)
        .unwrap();
      const previousBlockHash = br
        .readBuffer(32)
        .mapErr((err) => `Could not read previous block hash: ${err}`)
        .unwrap();
      const merkleRoot = br
        .readBuffer(32)
        .mapErr((err) => `Could not read merkle root: ${err}`)
        .unwrap();
      const timestamp = br
        .readUInt64BE()
        .mapErr((err) => `Could not read timestamp: ${err}`)
        .unwrap();
      const blockNum = br
        .readUInt64BE()
        .mapErr((err) => `Could not read block number: ${err}`)
        .unwrap();
      const target = br
        .readBuffer(32)
        .mapErr((err) => `Could not read target: ${err}`)
        .unwrap();
      const nonce = br
        .readBuffer(32)
        .mapErr((err) => `Could not read nonce: ${err}`)
        .unwrap();
      const workAlgo = br
        .readUInt64BE()
        .mapErr((err) => `Could not read work algorithm: ${err}`)
        .unwrap();
      const workSer = br
        .readBuffer(32)
        .mapErr((err) => `Could not read serial work: ${err}`)
        .unwrap();
      const workPar = br
        .readBuffer(32)
        .mapErr((err) => `Could not read parallel work: ${err}`)
        .unwrap();
      return Ok(
        new Header(
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
        ),
      );
    } catch (err) {
      return Err(err?.toString() || "Unknown error parsing header");
    }
  }

  toIsoBufWriter(bw: IsoBufWriter): IsoBufWriter {
    bw.writeUInt32BE(this.version);
    bw.writeBuffer(this.prevBlockId);
    bw.writeBuffer(this.merkleRoot);
    bw.writeUInt64BE(this.timestamp);
    bw.writeUInt64BE(this.blockNum);
    bw.writeBuffer(this.target);
    bw.writeBuffer(this.nonce);
    bw.writeUInt64BE(this.workAlgo);
    bw.writeBuffer(this.workSer);
    bw.writeBuffer(this.workPar);
    return bw;
  }

  toIsoHex(): string {
    return this.toIsoBuf().toString("hex");
  }

  static fromIsoHex(str: string): Result<Header, string> {
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
  ): Result<Header, string> {
    try {
      let target = null;
      const blockNum = prevBlockHeader.blockNum + 1n;
      if (blockNum % Header.BLOCKS_PER_ADJUSTMENT === 0n) {
        if (
          !prevAdjustmentBlockHeader ||
          prevAdjustmentBlockHeader.blockNum + Header.BLOCKS_PER_ADJUSTMENT !==
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
      const workAlgo = prevBlockHeader.workAlgo;
      const workSer = Buffer.alloc(32);
      const workPar = Buffer.alloc(32);
      return Ok(
        new Header(
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
        ),
      );
    } catch (err) {
      return Err(err?.toString() || "Unknown error creating block header");
    }
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
