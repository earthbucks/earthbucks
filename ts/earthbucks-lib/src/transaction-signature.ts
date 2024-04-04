export default class TransactionSignature {
  static readonly SIGHASH_ALL = 0x00000001
  static readonly SIGHASH_NONE = 0x00000002
  static readonly SIGHASH_SINGLE = 0x00000003
  static readonly SIGHASH_ANYONECANPAY = 0x00000080

  hashType: number
  sigBuf: Uint8Array

  constructor(hashType: number, sigBuf: Uint8Array) {
    this.hashType = hashType
    this.sigBuf = sigBuf
  }

  toU8Vec(): Uint8Array {
    const hashTypeBuf = Buffer.alloc(1)
    hashTypeBuf.writeUInt8(this.hashType)
    return new Uint8Array(Buffer.concat([hashTypeBuf, this.sigBuf]))
  }

  static fromU8Vec(u8vec: Uint8Array): TransactionSignature {
    const hashType = u8vec[0]
    const sigBuf = u8vec.slice(1)
    return new TransactionSignature(hashType, sigBuf)
  }
}
