import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'

export default class BlockHeader {
  version: number // uint32
  previousBlockHash: Uint8Array // 256 bits
  merkleRoot: Uint8Array // 256 bits
  timestamp: number // uint32
  target: Uint8Array // 256 bits
  nonce: Uint8Array // 256 bits
  index: bigint // uint64

  constructor(
    version: number,
    previousBlockHash: Uint8Array,
    merkleRoot: Uint8Array,
    timestamp: number,
    target: Uint8Array,
    nonce: Uint8Array,
    index: bigint,
  ) {
    this.version = version
    this.previousBlockHash = previousBlockHash
    this.merkleRoot = merkleRoot
    this.timestamp = timestamp
    this.target = target
    this.nonce = nonce
    this.index = index
  }

  toU8Vec(): Uint8Array {
    const bw = new BufferWriter()
    bw.writeUInt32BE(this.version)
    bw.writeU8Vec(this.previousBlockHash)
    bw.writeU8Vec(this.merkleRoot)
    bw.writeUInt32BE(this.timestamp)
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
    const timestamp = br.readUInt32BE()
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

  toString(): string {
    return this.toBuffer().toString('hex')
  }

  static fromString(str: string): BlockHeader {
    return BlockHeader.fromBuffer(Buffer.from(str, 'hex'))
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

  isValid(): boolean {
    const len = this.toBuffer().length
    if (len !== 144) {
      return false
    }
    return (
      BlockHeader.isValidVersion(this.version) &&
      BlockHeader.isValidPreviousBlockHash(this.previousBlockHash) &&
      BlockHeader.isValidMerkleRoot(this.merkleRoot) &&
      BlockHeader.isValidNonce(this.nonce)
    )
  }
}
