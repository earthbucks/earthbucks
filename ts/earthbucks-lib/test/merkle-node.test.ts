import { describe, expect, test, beforeEach, it } from '@jest/globals'
import MerkleNode from '../src/merkle-node'
import { doubleBlake3Hash } from '../src/blake3'

describe('MerkleNode', () => {
  test('fromU8Vecs with 1 data', () => {
    const data1 = doubleBlake3Hash(Buffer.from('data1'))

    const data = [data1]
    const root = MerkleNode.fromU8Vecs(data)
    const hex = Buffer.from(root.hash()).toString('hex')
    expect(hex).toBe(
      '689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244',
    )
  })

  test('fromU8Vecs with 2 datas', () => {
    const data1 = doubleBlake3Hash(Buffer.from('data1'))
    const data2 = doubleBlake3Hash(Buffer.from('data2'))

    const data = [data1, data2]
    const root = MerkleNode.fromU8Vecs(data)
    const hex = Buffer.from(root.hash()).toString('hex')
    expect(hex).toBe(
      'fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde',
    )
  })

  test('fromU8Vecs with 4 datas', () => {
    const data1 = doubleBlake3Hash(Buffer.from('data1'))
    const data2 = doubleBlake3Hash(Buffer.from('data2'))
    const data3 = doubleBlake3Hash(Buffer.from('data3'))
    const data4 = doubleBlake3Hash(Buffer.from('data4'))

    const data = [data1, data2, data3, data4]
    const root = MerkleNode.fromU8Vecs(data)
    const hex = Buffer.from(root.hash()).toString('hex')
    expect(hex).toBe(
      'a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187',
    )
  })
})
