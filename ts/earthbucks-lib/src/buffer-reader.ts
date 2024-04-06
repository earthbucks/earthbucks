export default class BufferReader {
  private buf: Buffer
  private pos: number

  constructor(buf: Uint8Array) {
    // create a Buffer with the same memory as the ArrayBuffer
    this.buf = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
    this.pos = 0
  }

  eof(): boolean {
    return this.pos >= this.buf.length
  }

  readU8Vec(len: number = this.buf.length): Uint8Array {
    const buf = this.buf.subarray(this.pos, this.pos + len)
    const arr = new Uint8Array(len)
    arr.set(buf)
    this.pos += len
    return arr
  }

  readReverse(len: number = this.buf.length): Buffer {
    const buf = this.buf.subarray(this.pos, this.pos + len)
    this.pos += len
    const buf2 = Buffer.alloc(buf.length)
    for (let i = 0; i < buf2.length; i++) {
      buf2[i] = buf[buf.length - 1 - i]
    }
    return buf2
  }

  readUInt8(): number {
    const val = this.buf.readUInt8(this.pos)
    this.pos += 1
    return val
  }

  readInt8(): number {
    const val = this.buf.readInt8(this.pos)
    this.pos += 1
    return val
  }

  readUInt16BE(): number {
    const val = this.buf.readUInt16BE(this.pos)
    this.pos += 2
    return val
  }

  readInt16BE(): number {
    const val = this.buf.readInt16BE(this.pos)
    this.pos += 2
    return val
  }

  readUInt16LE(): number {
    const val = this.buf.readUInt16LE(this.pos)
    this.pos += 2
    return val
  }

  readInt16LE(): number {
    const val = this.buf.readInt16LE(this.pos)
    this.pos += 2
    return val
  }

  readUInt32BE(): number {
    const val = this.buf.readUInt32BE(this.pos)
    this.pos += 4
    return val
  }

  readInt32BE(): number {
    const val = this.buf.readInt32BE(this.pos)
    this.pos += 4
    return val
  }

  readUInt32LE(): number {
    const val = this.buf.readUInt32LE(this.pos)
    this.pos += 4
    return val
  }

  readInt32LE(): number {
    const val = this.buf.readInt32LE(this.pos)
    this.pos += 4
    return val
  }

  readUInt64BEBigInt(): bigint {
    const buf = this.buf.subarray(this.pos, this.pos + 8)
    const bn = BigInt('0x' + buf.toString('hex'))
    this.pos += 8
    return bn
  }

  readUInt64LEBigInt(): bigint {
    const buf = this.readReverse(8)
    const bn = BigInt('0x' + buf.toString('hex'))
    return bn
  }

  readVarIntNum(): number {
    const first = this.readUInt8()
    let bn: bigint, n: number
    switch (first) {
      case 0xfd:
        return this.readUInt16BE()
      case 0xfe:
        return this.readUInt32BE()
      case 0xff:
        bn = this.readUInt64BEBigInt()
        n = Number(bn)
        if (n <= Number.MAX_SAFE_INTEGER) {
          return n
        } else {
          throw new Error(
            'number too large to retain precision - use readVarIntBn',
          )
        }
      default:
        return first
    }
  }

  readVarIntBuf(): Uint8Array {
    const first = this.buf.readUInt8(this.pos)
    switch (first) {
      case 0xfd:
        return this.readU8Vec(1 + 2)
      case 0xfe:
        return this.readU8Vec(1 + 4)
      case 0xff:
        return this.readU8Vec(1 + 8)
      default:
        return this.readU8Vec(1)
    }
  }

  readVarIntBigInt(): bigint {
    const first = this.readUInt8()
    switch (first) {
      case 0xfd:
        return BigInt(this.readUInt16BE())
      case 0xfe:
        return BigInt(this.readUInt32BE())
      case 0xff:
        return this.readUInt64BEBigInt()
      default:
        return BigInt(first)
    }
  }
}
