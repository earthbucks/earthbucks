import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'

export default class VarInt {
  private buf: Buffer

  constructor (buf: Buffer = Buffer.alloc(0)) {
    this.buf = buf
  }

  fromBigInt (bn: bigint) {
    this.buf = new BufferWriter().writeVarIntBigInt(bn).toBuffer()
    return this
  }

  static fromBn (bn: bigint) {
    return new this().fromBigInt(bn)
  }

  fromNumber (num: number) {
    this.buf = new BufferWriter().writeVarIntNum(num).toBuffer()
    return this
  }

  static fromNumber (num: number) {
    return new this().fromNumber(num)
  }

  toUint8Array () {
    return new Uint8Array(this.buf)
  }

  toBuffer () {
    return this.buf
  }

  toBigInt (): bigint {
    return new BufferReader(this.buf).readVarIntBigInt()
  }

  toNumber () {
    return new BufferReader(this.buf).readVarIntNum()
  }

  isMinimal () {
    const bn = this.toBigInt()
    const varint = new VarInt().fromBigInt(bn)
    return Buffer.compare(this.buf, varint.toBuffer()) === 0
  }
}