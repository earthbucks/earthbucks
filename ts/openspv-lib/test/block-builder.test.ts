import { describe, expect, test, beforeEach, it } from '@jest/globals'
import BlockHeader from '../src/block-header'
import Block from '../src/block'
import Tx from '../src/tx'
import BufferWriter from '../src/buffer-writer'
import BufferReader from '../src/buffer-reader'
import BlockBuilder from '../src/block-builder'
import Script from '../src/script'

describe('BlockBuilder', () => {
  test('fromBlock', () => {
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
    const bb = BlockBuilder.fromBlock(block)
    expect(bb.header.version).toBe(bh.version)
    expect(bb.header.prevBlockId).toEqual(bh.prevBlockId)
    expect(bb.header.merkleRoot).toEqual(bh.merkleRoot)
    expect(bb.header.timestamp).toBe(bh.timestamp)
    expect(bb.header.target).toEqual(bh.target)
  })

  test('fromGenesis', () => {
    const target = new Uint8Array(32)
    const outputScript = new Script()
    const outputAmount = 0n
    const bb = BlockBuilder.fromGenesis(target, outputScript, outputAmount)
    expect(bb.header.version).toBe(1)
    expect(bb.header.prevBlockId).toEqual(new Uint8Array(32))
    expect(bb.header.merkleRoot).toEqual(bb.merkleTxs.root)
    expect(bb.header.timestamp).toBeLessThanOrEqual(new Date().getTime() / 1000)
    expect(bb.header.target).toEqual(target)
  })

  test('fromPrevBlockHeader', () => {
    const outputScript = new Script()
    const outputAmount = 0n
    const target = new Uint8Array(32)
    const prevBlockHeader = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      target,
      new Uint8Array(32),
      0n,
    )
    const bb = BlockBuilder.fromPrevBlockHeader(
      prevBlockHeader,
      null,
      outputScript,
      outputAmount,
    )
    expect(bb.header.version).toBe(1)
    expect(bb.header.prevBlockId).toEqual(prevBlockHeader.id())
    expect(bb.header.merkleRoot).toEqual(bb.merkleTxs.root)
    expect(bb.header.timestamp).toBeLessThanOrEqual(new Date().getTime() / 1000)
    expect(bb.header.target).toEqual(target)
  })

  test('toBlock', () => {
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
    const bb = BlockBuilder.fromBlock(block)
    const block2 = bb.toBlock()
    expect(block2.header.version).toBe(bh.version)
    expect(block2.header.prevBlockId).toEqual(bh.prevBlockId)
    expect(block2.header.merkleRoot).toEqual(bh.merkleRoot)
    expect(bb.header.timestamp).toEqual(0n)
    expect(block2.header.target).toEqual(bh.target)
  })
})
