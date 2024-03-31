// big integers, positive or negative, encoded as big endian, two's complement

export default class ScriptNum {
  num: bigint

  constructor(num: bigint = BigInt(0)) {
    this.num = num
  }

  fromBuffer(buffer: Buffer): this {
    const isNegative = buffer[0] & 0x80 // Check if the sign bit is set
    if (isNegative) {
      // If the number is negative
      let invertedBuffer = Buffer.alloc(buffer.length)
      for (let i = 0; i < buffer.length; i++) {
        invertedBuffer[i] = ~buffer[i] // Invert all bits
      }
      const invertedBigInt = BigInt('0x' + invertedBuffer.toString('hex'))
      this.num = -(invertedBigInt + 1n) // Add one and negate to get the original number
    } else {
      // If the number is positive
      this.num = BigInt('0x' + buffer.toString('hex'))
    }
    return this
  }

  static fromBuffer(buffer: Buffer): ScriptNum {
    return new ScriptNum().fromBuffer(buffer)
  }

  static fromU8Vec(u8vec: Uint8Array): ScriptNum {
    return new ScriptNum().fromBuffer(Buffer.from(u8vec))
  }

  toBuffer(): Buffer {
    const num = this.num
    if (num >= 0n) {
      let hex = num.toString(16)
      if (hex.length % 2 !== 0) {
        hex = '0' + hex // Pad with zero to make length even
      }
      // If the most significant bit is set, add an extra zero byte at the start
      if (parseInt(hex[0], 16) >= 8) {
        hex = '00' + hex
      }
      return Buffer.from(hex, 'hex')
    } else {
      const bitLength = num.toString(2).length // Get bit length of number
      const byteLength = Math.ceil(bitLength / 8) // Calculate byte length, rounding up to nearest byte
      const twosComplement = 2n ** BigInt(8 * byteLength) + num // Calculate two's complement
      let hex = twosComplement.toString(16)
      if (hex.length % 2 !== 0) {
        hex = '0' + hex // Pad with zero to make length even
      }
      return Buffer.from(hex, 'hex')
    }
  }

  toU8Vec(): Uint8Array {
    return new Uint8Array(this.toBuffer())
  }

  toString(): string {
    return this.num.toString()
  }

  fromString(str: string): this {
    this.num = BigInt(str)
    return this
  }

  static fromString(str: string): ScriptNum {
    return new ScriptNum().fromString(str)
  }
}
