import { describe, expect, test, beforeEach, it } from '@jest/globals'
import MerkleNode from '../src/merkle-node'
import { doubleBlake3Hash } from '../src/blake3'

describe('MerkleNode', () => {
  test('fromU8Vecs', () => {
    const data1 = doubleBlake3Hash(Buffer.from('data1'))
    const data2 = doubleBlake3Hash(Buffer.from('data2'))
    const data3 = doubleBlake3Hash(Buffer.from('data3'))
    const data4 = doubleBlake3Hash(Buffer.from('data4'))

    const data = [data1, data2, data3, data4]
    const root = MerkleNode.fromU8Vecs(data)
    const hex = Buffer.from(root.hash()).toString('hex')
    expect(hex).toBe('a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187')
  })
})