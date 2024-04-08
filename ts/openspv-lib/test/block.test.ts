import { describe, expect, test, beforeEach, it } from '@jest/globals'
import BlockHeader from '../src/block-header'
import Block from '../src/block'
import Tx from '../src/tx'
import BufferWriter from '../src/buffer-writer'
import BufferReader from '../src/buffer-reader'

describe('Block', () => {
  test('toBufferWriter', () => {
    const bh = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    const tx = new Tx(1, [], [], 0n)
    const block = new Block(bh, [tx])
    const bw = block.toBufferWriter(new BufferWriter())
    expect(bw.toU8Vec().length).toBeGreaterThan(0)
  })

  test('toU8Vec', () => {
    const bh = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    const tx = new Tx(1, [], [], 0n)
    const block = new Block(bh, [tx])
    const u8vec = block.toU8Vec()
    expect(u8vec.length).toBeGreaterThan(0)
  })

  test('fromBufferReader', () => {
    const bh = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    const tx = new Tx(1, [], [], 0n)
    const block = new Block(bh, [tx])
    const bw = block.toBufferWriter(new BufferWriter())
    const br = new BufferReader(bw.toU8Vec())
    const block2 = Block.fromBufferReader(br)
    expect(block2.header.version).toBe(bh.version)
    expect(block2.header.previousBlockHash).toEqual(bh.previousBlockHash)
    expect(block2.header.merkleRoot).toEqual(bh.merkleRoot)
    expect(block2.header.timestamp).toBe(bh.timestamp)
    expect(block2.header.target).toEqual(bh.target)
    expect(block2.header.nonce).toEqual(bh.nonce)
    expect(block2.header.index).toBe(bh.index)
  })

  test('isGenesis', () => {
    const bh = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    const tx = new Tx(1, [], [], 0n)
    const block = new Block(bh, [tx])
    expect(block.isGenesis()).toBe(true)
  })
})
