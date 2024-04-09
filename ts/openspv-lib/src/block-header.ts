import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'
import { blake3Hash, doubleBlake3Hash } from './blake3'

export default class BlockHeader {
  static readonly BLOCKS_PER_ADJUSTMENT = 2016n
  static readonly BLOCK_INTERVAL = 600n // seconds

  version: number // uint32
  prevBlockId: Uint8Array // 256 bits
  merkleRoot: Uint8Array // 256 bits
  timestamp: bigint // uint64
  target: Uint8Array // 256 bits
  nonce: Uint8Array // 256 bits
  index: bigint // uint64

  constructor(
    version: number,
    prevBlockId: Uint8Array,
    merkleRoot: Uint8Array,
    timestamp: bigint,
    target: Uint8Array,
    nonce: Uint8Array,
    index: bigint,
  ) {
    this.version = version
    this.prevBlockId = prevBlockId
    this.merkleRoot = merkleRoot
    this.timestamp = timestamp
    this.target = target
    this.nonce = nonce
    this.index = index
  }

  toU8Vec(): Uint8Array {
    const bw = new BufferWriter()
    bw.writeUInt32BE(this.version)
    bw.writeU8Vec(this.prevBlockId)
    bw.writeU8Vec(this.merkleRoot)
    bw.writeUInt64BEBigInt(this.timestamp)
    bw.writeU8Vec(this.target)
    bw.writeU8Vec(this.nonce)
    bw.writeUInt64BEBigInt(this.index)
    return bw.toU8Vec()
  }

  static fromU8Vec(buf: Uint8Array): BlockHeader {
    const br = new BufferReader(buf)
    const version = br.readUInt32BE()
    const previousBlockHash = br.readU8Vec(32)
    const merkleRoot = br.readU8Vec(32)
    const timestamp = br.readUInt64BEBigInt()
    const target = br.readU8Vec(32)
    const nonce = br.readU8Vec(32)
    const index = br.readUInt64BEBigInt()
    return new BlockHeader(
      version,
      previousBlockHash,
      merkleRoot,
      timestamp,
      target,
      nonce,
      index,
    )
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toU8Vec())
  }

  static fromBuffer(buf: Buffer): BlockHeader {
    return BlockHeader.fromU8Vec(Uint8Array.from(buf))
  }

  static fromBufferReader(br: BufferReader): BlockHeader {
    const version = br.readUInt32BE()
    const previousBlockHash = br.readU8Vec(32)
    const merkleRoot = br.readU8Vec(32)
    const timestamp = br.readUInt64BEBigInt()
    const target = br.readU8Vec(32)
    const nonce = br.readU8Vec(32)
    const index = br.readUInt64BEBigInt()
    return new BlockHeader(
      version,
      previousBlockHash,
      merkleRoot,
      timestamp,
      target,
      nonce,
      index,
    )
  }

  toBufferWriter(bw: BufferWriter): BufferWriter {
    bw.writeUInt32BE(this.version)
    bw.writeU8Vec(this.prevBlockId)
    bw.writeU8Vec(this.merkleRoot)
    bw.writeUInt64BEBigInt(this.timestamp)
    bw.writeU8Vec(this.target)
    bw.writeU8Vec(this.nonce)
    bw.writeUInt64BEBigInt(this.index)
    return bw
  }

  toString(): string {
    return this.toBuffer().toString('hex')
  }

  static fromString(str: string): BlockHeader {
    return BlockHeader.fromBuffer(Buffer.from(str, 'hex'))
  }

  static fromGenesis(initialTarget: Uint8Array): BlockHeader {
    const timestamp = BigInt(Math.floor(Date.now() / 1000)) // seconds
    return new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      timestamp,
      initialTarget,
      new Uint8Array(32),
      0n,
    )
  }

  static fromPrevBlockHeader(
    prevBlockHeader: BlockHeader,
    target: Uint8Array,
  ): BlockHeader {
    const prevBlockId = prevBlockHeader.id()
    const prevBlockIndex = prevBlockHeader.index
    const timestamp = BigInt(Math.floor(Date.now() / 1000)) // seconds
    const index = prevBlockIndex + 1n
    const nonce = new Uint8Array(32)
    return new BlockHeader(
      1,
      prevBlockId,
      new Uint8Array(32),
      timestamp,
      target,
      nonce,
      index,
    )
  }

  static isValidVersion(version: number): boolean {
    return version === 1
  }

  static isValidPreviousBlockHash(previousBlockHash: Uint8Array): boolean {
    return previousBlockHash.length === 32
  }

  static isValidMerkleRoot(merkleRoot: Uint8Array): boolean {
    return merkleRoot.length === 32
  }

  static isValidNonce(nonce: Uint8Array): boolean {
    return nonce.length === 32
  }

  static isValidTarget(target: Uint8Array): boolean {
    return target.length === 32
  }

  isValid(): boolean {
    const len = this.toBuffer().length
    if (len !== 148) {
      return false
    }
    return (
      BlockHeader.isValidVersion(this.version) &&
      BlockHeader.isValidPreviousBlockHash(this.prevBlockId) &&
      BlockHeader.isValidMerkleRoot(this.merkleRoot) &&
      BlockHeader.isValidNonce(this.nonce) &&
      BlockHeader.isValidTarget(this.target)
    )
  }

  isGenesis(): boolean {
    return this.index === 0n && this.prevBlockId.every((byte) => byte === 0)
  }

  hash(): Uint8Array {
    return blake3Hash(this.toU8Vec())
  }

  id(): Uint8Array {
    return doubleBlake3Hash(this.toU8Vec())
  }

  static adjustTarget(targetBuf: Uint8Array, timeDiff: bigint): Uint8Array {
    const target = BigInt('0x' + Buffer.from(targetBuf).toString('hex'))
    const twoWeeks =
      BlockHeader.BLOCKS_PER_ADJUSTMENT * BlockHeader.BLOCK_INTERVAL

    // To prevent extreme difficulty adjustments, if it took less than 1 week or
    // more than 8 weeks, we still consider it as 1 week or 8 weeks
    // respectively.
    if (timeDiff < twoWeeks / 2n) {
      timeDiff = twoWeeks / 2n // seconds
    }
    if (timeDiff > twoWeeks * 2n) {
      timeDiff = twoWeeks * 2n // seconds
    }

    const newTarget = (target * timeDiff) / twoWeeks // seconds

    const newTargetBuf = Buffer.from(
      newTarget.toString(16).padStart(64, '0'),
      'hex',
    )
    return Uint8Array.from(newTargetBuf)
  }
}
