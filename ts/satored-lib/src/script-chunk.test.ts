import { describe, expect, test, beforeEach, it } from '@jest/globals'
import { ScriptChunk } from './script-chunk'
import { NAME_TO_OPCODE } from './opcode'

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
      const scriptChunk = new ScriptChunk(NAME_TO_OPCODE.IF)
      expect(scriptChunk.toString()).toBe('IF')
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer', () => {
      const buffer = new Uint8Array(255).fill(0)
      const scriptChunk = new ScriptChunk(NAME_TO_OPCODE.OP_PUSHDATA1, buffer)
      expect(scriptChunk.toString()).toBe('0x' + '00'.repeat(255))
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer', () => {
      const buffer = new Uint8Array(256).fill(0)
      const scriptChunk = new ScriptChunk(NAME_TO_OPCODE.OP_PUSHDATA2, buffer)
      expect(scriptChunk.toString()).toBe('0x' + '00'.repeat(256))
    })

    test('should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer', () => {
      const buffer = new Uint8Array(65536).fill(0)
      const scriptChunk = new ScriptChunk(NAME_TO_OPCODE.OP_PUSHDATA4, buffer)
      expect(scriptChunk.toString()).toBe('0x' + '00'.repeat(65536))
    })
  })

  describe('fromString', () => {
    test('should create a ScriptChunk from opcode IF', () => {
      const scriptChunk = ScriptChunk.fromString('IF')
      expect(scriptChunk.opcode).toBe(NAME_TO_OPCODE.IF)
      expect(scriptChunk.buffer).toBeUndefined()
    })
  
    test('should create a ScriptChunk from opcode OP_PUSHDATA1 and a buffer', () => {
      const scriptChunk = ScriptChunk.fromString('0x' + '00'.repeat(255))
      expect(scriptChunk.opcode).toBe(NAME_TO_OPCODE.OP_PUSHDATA1)
      expect(scriptChunk.buffer).toEqual(Buffer.from(new Uint8Array(255).fill(0)))
    })
  
    test('should create a ScriptChunk from opcode OP_PUSHDATA2 and a buffer', () => {
      const scriptChunk = ScriptChunk.fromString('0x' + '00'.repeat(256))
      expect(scriptChunk.opcode).toBe(NAME_TO_OPCODE.OP_PUSHDATA2)
      expect(scriptChunk.buffer).toEqual(Buffer.from(new Uint8Array(256).fill(0)))
    })
  
    test('should create a ScriptChunk from opcode OP_PUSHDATA4 and a buffer', () => {
      const scriptChunk = ScriptChunk.fromString('0x' + '00'.repeat(65536))
      expect(scriptChunk.opcode).toBe(NAME_TO_OPCODE.OP_PUSHDATA4)
      expect(scriptChunk.buffer).toEqual(Buffer.from(new Uint8Array(65536).fill(0)))
    })
  
    test('should throw an error for invalid opcode', () => {
      expect(() => ScriptChunk.fromString('INVALID_OPCODE')).toThrow('invalid opcode')
    })
  })
})
