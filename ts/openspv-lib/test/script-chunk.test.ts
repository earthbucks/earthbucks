import { describe, expect, test, beforeEach, it } from '@jest/globals'
import ScriptChunk from '../src/script-chunk'
import { OP } from '../src/opcode'
import BufferWriter from '../src/buffer-writer'

describe('ScriptChunk', () => {
  let scriptChunk: ScriptChunk

  beforeEach(() => {
    scriptChunk = new ScriptChunk(0x4c, new Uint8Array([0, 1, 2, 3]))
  })

  test('should create a ScriptChunk', () => {
    expect(scriptChunk).toBeInstanceOf(ScriptChunk)
    expect(scriptChunk.opcode).toBe(0x4c)
    expect(scriptChunk.buffer).toEqual(Buffer.from([0, 1, 2, 3]))
  })

  describe('toString', () => {
    test('should create a ScriptChunk with opcode IF', () => {
      const scriptChunk = new ScriptChunk(OP.IF)
      expect(scriptChunk.toString()).toBe('IF')
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer', () => {
      const buffer = new Uint8Array(255).fill(0)
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer)
      expect(scriptChunk.toString()).toBe('0x' + '00'.repeat(255))
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer', () => {
      const buffer = new Uint8Array(256).fill(0)
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer)
      expect(scriptChunk.toString()).toBe('0x' + '00'.repeat(256))
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer', () => {
      const buffer = new Uint8Array(65536).fill(0)
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer)
      expect(scriptChunk.toString()).toBe('0x' + '00'.repeat(65536))
    })
  })

  describe('fromString', () => {
    test('should create a ScriptChunk from opcode IF', () => {
      const scriptChunk = ScriptChunk.fromString('IF')
      expect(scriptChunk.opcode).toBe(OP.IF)
      expect(scriptChunk.buffer).toBeUndefined()
    })

    test('should create a ScriptChunk from opcode OP_PUSHDATA1 and a buffer', () => {
      const scriptChunk = ScriptChunk.fromString('0x' + '00'.repeat(255))
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1)
      expect(scriptChunk.buffer).toEqual(
        Buffer.from(new Uint8Array(255).fill(0)),
      )
    })

    test('should create a ScriptChunk from opcode OP_PUSHDATA2 and a buffer', () => {
      const scriptChunk = ScriptChunk.fromString('0x' + '00'.repeat(256))
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2)
      expect(scriptChunk.buffer).toEqual(
        Buffer.from(new Uint8Array(256).fill(0)),
      )
    })

    test('should create a ScriptChunk from opcode OP_PUSHDATA4 and a buffer', () => {
      const scriptChunk = ScriptChunk.fromString('0x' + '00'.repeat(65536))
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4)
      expect(scriptChunk.buffer).toEqual(
        Buffer.from(new Uint8Array(65536).fill(0)),
      )
    })

    test('should throw an error for invalid opcode', () => {
      expect(() => ScriptChunk.fromString('INVALID_OPCODE')).toThrow(
        'invalid opcode',
      )
    })
  })

  describe('toU8Vec', () => {
    test('should convert a ScriptChunk with opcode IF to Uint8Array', () => {
      const scriptChunk = new ScriptChunk(OP.IF)
      expect(scriptChunk.toU8Vec()).toEqual(new Uint8Array([OP.IF]))
    })

    test('should convert a ScriptChunk with opcode OP_PUSHDATA1 and a buffer to Uint8Array', () => {
      const buffer = new Uint8Array(255).fill(0)
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer)
      const expected = new Uint8Array([OP.PUSHDATA1, buffer.length, ...buffer])
      expect(scriptChunk.toU8Vec()).toEqual(expected)
    })

    test('should convert a ScriptChunk with opcode OP_PUSHDATA2 and a buffer to Uint8Array', () => {
      const buffer = new Uint8Array(256).fill(0)
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer)
      const expected = new BufferWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(buffer.length)
        .writeU8Vec(buffer)
        .toU8Vec()
      expect(scriptChunk.toU8Vec()).toEqual(expected)
    })

    test('should convert a ScriptChunk with opcode OP_PUSHDATA4 and a buffer to Uint8Array', () => {
      const buffer = new Uint8Array(65536).fill(0)
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer)
      const expected = new BufferWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(buffer.length)
        .writeU8Vec(buffer)
        .toU8Vec()
      expect(scriptChunk.toU8Vec()).toEqual(expected)
    })

    test('pushdata1', () => {
      const scriptChunk = new ScriptChunk().fromString('0xff')
      const arr = scriptChunk.toU8Vec()
      expect(arr).toEqual(new Uint8Array([0x4c, 0x01, 0xff]))
    })
  })

  describe('fromU8Vec', () => {
    test('should create a ScriptChunk from Uint8Array with opcode IF', () => {
      const arr = new Uint8Array([OP.IF])
      const scriptChunk = new ScriptChunk().fromU8Vec(arr)
      expect(scriptChunk.opcode).toBe(OP.IF)
      expect(scriptChunk.buffer).toBeUndefined()
    })

    test('should create a ScriptChunk from Uint8Array with opcode OP_PUSHDATA1 and a buffer', () => {
      const buffer = new Uint8Array(255).fill(0)
      const arr = new Uint8Array([OP.PUSHDATA1, buffer.length, ...buffer])
      const scriptChunk = new ScriptChunk().fromU8Vec(arr)
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1)
      expect(scriptChunk.buffer).toEqual(Buffer.from(buffer))
    })

    test('should create a ScriptChunk from Uint8Array with opcode OP_PUSHDATA2 and a buffer', () => {
      const buffer = new Uint8Array(256).fill(0)
      const arr = new BufferWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(buffer.length)
        .writeU8Vec(buffer)
        .toU8Vec()
      const scriptChunk = new ScriptChunk().fromU8Vec(arr)
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2)
      expect(scriptChunk.buffer).toEqual(Buffer.from(buffer))
    })

    test('should create a ScriptChunk from Uint8Array with opcode OP_PUSHDATA4 and a buffer', () => {
      const buffer = new Uint8Array(65536).fill(0)
      const arr = new BufferWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(buffer.length)
        .writeU8Vec(buffer)
        .toU8Vec()
      const scriptChunk = new ScriptChunk().fromU8Vec(arr)
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4)
      expect(scriptChunk.buffer).toEqual(Buffer.from(buffer))
    })

    test('should throw error if length does not match expected length', () => {
      const buffer = new Uint8Array(100).fill(0)
      const arr = new Uint8Array([OP.PUSHDATA1, 200, ...buffer])
      expect(() => new ScriptChunk().fromU8Vec(arr)).toThrow(
        'Buffer length is other than expected',
      )
    })

    test('should throw error if length does not match expected length', () => {
      const buffer = new Uint8Array(100).fill(0)
      const arr = new BufferWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(200)
        .writeU8Vec(buffer)
        .toU8Vec()
      expect(() => new ScriptChunk().fromU8Vec(arr)).toThrow(
        'Buffer length is other than expected',
      )
    })

    test('should throw error if length does not match expected length', () => {
      const buffer = new Uint8Array(100).fill(0)
      const arr = new BufferWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(200)
        .writeU8Vec(buffer)
        .toU8Vec()
      expect(() => new ScriptChunk().fromU8Vec(arr)).toThrow(
        'Buffer length is other than expected',
      )
    })
  })

  describe('fromData', () => {
    test('should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer', () => {
      const buffer = new Uint8Array(255).fill(0)
      const scriptChunk = ScriptChunk.fromData(buffer)
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1)
      expect(scriptChunk.buffer).toEqual(Buffer.from(buffer))
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer', () => {
      const buffer = new Uint8Array(256).fill(0)
      const scriptChunk = ScriptChunk.fromData(buffer)
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2)
      expect(scriptChunk.buffer).toEqual(Buffer.from(buffer))
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer', () => {
      const buffer = new Uint8Array(65536).fill(0)
      const scriptChunk = ScriptChunk.fromData(buffer)
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4)
      expect(scriptChunk.buffer).toEqual(Buffer.from(buffer))
    })
  })
})