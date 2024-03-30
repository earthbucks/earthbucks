export default class BufferWriter {
  bufs: Buffer[]

  constructor(arrs?: Uint8Array[]) {
    this.bufs = arrs ? arrs.map((arr) => Buffer.from(arr)) : []
  }

  getLength(): number {
    let len = 0
    for (const buf of this.bufs) {
      len += buf.length
    }
    return len
  }

  toU8Vec(): Uint8Array {
    const buffer = Buffer.concat(this.bufs)
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  }

  toBuffer(): Buffer {
    return Buffer.concat(this.bufs)
  }

  writeBuffer(buf: Buffer): this {
    this.bufs.push(buf)
    return this
  }

  writeUInt8Array(arr: Uint8Array): this {
    this.bufs.push(Buffer.from(arr))
    return this
  }

  writeReverse(buf: Buffer): this {
    const buf2 = Buffer.alloc(buf.length)
    for (let i = 0; i < buf2.length; i++) {
      buf2[i] = buf[buf.length - 1 - i]
    }
    this.bufs.push(buf2)
    return this
  }

  writeUInt8(n: number): this {
    const buf = Buffer.alloc(1)
    buf.writeUInt8(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeInt8(n: number): this {
    const buf = Buffer.alloc(1)
    buf.writeInt8(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeUInt16BE(n: number): this {
    const buf = Buffer.alloc(2)
    buf.writeUInt16BE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeInt16BE(n: number): this {
    const buf = Buffer.alloc(2)
    buf.writeInt16BE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeUInt16LE(n: number): this {
    const buf = Buffer.alloc(2)
    buf.writeUInt16LE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeInt16LE(n: number): this {
    const buf = Buffer.alloc(2)
    buf.writeInt16LE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeUInt32BE(n: number): this {
    const buf = Buffer.alloc(4)
    buf.writeUInt32BE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeInt32BE(n: number): this {
    const buf = Buffer.alloc(4)
    buf.writeInt32BE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeUInt32LE(n: number): this {
    const buf = Buffer.alloc(4)
    buf.writeUInt32LE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeInt32LE(n: number): this {
    const buf = Buffer.alloc(4)
    buf.writeInt32LE(n, 0)
    this.writeBuffer(buf)
    return this
  }

  writeUInt64BEBigInt(bn: bigint): this {
    const buf = Buffer.alloc(8)
    buf.writeBigInt64BE(bn)
    this.writeBuffer(buf)
    return this
  }

  writeUInt64LEBigInt(bn: bigint): this {
    const buf = Buffer.alloc(8)
    buf.writeBigInt64LE(bn)
    this.writeBuffer(buf)
    return this
  }

  writeVarIntNum(n: number): this {
    const buf = BufferWriter.varIntBufNum(n)
    this.writeUInt8Array(buf)
    return this
  }

  writeVarIntBigInt(bn: bigint): this {
    const buf = BufferWriter.varIntBufBigInt(bn)
    this.writeUInt8Array(buf)
    return this
  }

  static varIntBufNum(n: number): Uint8Array {
    let buf: Buffer
    if (n < 253) {
      buf = Buffer.alloc(1)
      buf.writeUInt8(n, 0)
    } else if (n < 0x10000) {
      buf = Buffer.alloc(1 + 2)
      buf.writeUInt8(253, 0)
      buf.writeUInt16BE(n, 1)
    } else if (n < 0x100000000) {
      buf = Buffer.alloc(1 + 4)
      buf.writeUInt8(254, 0)
      buf.writeUInt32BE(n, 1)
    } else {
      buf = Buffer.alloc(1 + 8)
      buf.writeUInt8(255, 0)
      buf.writeInt32BE(n & -1, 1)
      buf.writeUInt32BE(Math.floor(n / 0x100000000), 5)
    }
    const arr = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    return arr
  }

  static varIntBufBigInt(bn: bigint): Uint8Array {
    let buf: Buffer
    const n = Number(bn)
    if (n < 253) {
      buf = Buffer.alloc(1)
      buf.writeUInt8(n, 0)
    } else if (n < 0x10000) {
      buf = Buffer.alloc(1 + 2)
      buf.writeUInt8(253, 0)
      buf.writeUInt16BE(n, 1)
    } else if (n < 0x100000000) {
      buf = Buffer.alloc(1 + 4)
      buf.writeUInt8(254, 0)
      buf.writeUInt32BE(n, 1)
    } else {
      const bw = new BufferWriter()
      bw.writeUInt8(255)
      bw.writeUInt64BEBigInt(bn)
      buf = bw.toBuffer()
    }
    const arr = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    return arr
  }
}
