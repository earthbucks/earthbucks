import { describe, expect, test, beforeEach } from '@jest/globals'
import BufferReader from './buffer-reader'

describe('BufferReader', () => {
  let bufferReader: BufferReader
  let testBuffer: Uint8Array

  beforeEach(() => {
    testBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
    bufferReader = new BufferReader(testBuffer)
  })

  test('constructor sets buffer and position', () => {
    expect(bufferReader['buf']).toEqual(
      Buffer.from(
        testBuffer.buffer,
        testBuffer.byteOffset,
        testBuffer.byteLength,
      ),
    )
    expect(bufferReader['pos']).toBe(0)
  })

  test('read returns correct subarray', () => {
    const len = 4
    const result = bufferReader.read(len)
    expect(result).toEqual(new Uint8Array(testBuffer.buffer, 0, len))
  })

  test('read updates position', () => {
    const len = 4
    bufferReader.read(len)
    expect(bufferReader['pos']).toBe(len)
  })

  test('readUInt8 returns correct value and updates position', () => {
    const result = bufferReader.readUInt8()
    expect(result).toBe(1)
    expect(bufferReader['pos']).toBe(1)
  })

  test('readUInt16 returns correct value and updates position', () => {
    const result = bufferReader.readUInt16BE()
    expect(result).toBe(Buffer.from([1, 2]).readUInt16BE()) // 513 is the decimal representation of the bytes [1, 2] in big endian order
    expect(bufferReader['pos']).toBe(2)
  })

  test('readUInt32 returns correct value and updates position', () => {
    const result = bufferReader.readUInt32BE()
    expect(result).toBe(Buffer.from([1, 2, 3, 4]).readUInt32BE()) // 16909060 is the decimal representation of the bytes [1, 2, 3, 4] in big endian order
    expect(bufferReader['pos']).toBe(4)
  })

  test('readVarIntNum returns correct value and updates position for small numbers', () => {
    const result = bufferReader.readVarIntNum()
    expect(result).toBe(1) // Assuming that the implementation treats a single byte as a varint
    expect(bufferReader['pos']).toBe(1)
  })

  test('readVarIntNum returns correct value and updates position for large numbers', () => {
    const buf = Buffer.from([254, 0, 0, 0, 0])
    buf.writeUInt32LE(50000, 1)
    bufferReader = new BufferReader(buf) // A varint that represents the number 2^30
    const result = bufferReader.readVarIntNum()
    expect(result).toBe(50000) // 2^30
    expect(bufferReader['pos']).toBe(5)
  })
})
