import { describe, expect, test, beforeEach, it } from '@jest/globals'
import BlockHeader from '../src/block-header'
import { Buffer } from 'buffer'

describe('BlockHeader', () => {
  test('toU8Vec and fromU8Vec', () => {
    const bh1 = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    const buf = bh1.toU8Vec()
    const bh2 = BlockHeader.fromU8Vec(buf)
    expect(bh1.version).toBe(bh2.version)
    expect(bh1.prevBlockId).toEqual(bh2.prevBlockId)
    expect(bh1.merkleRoot).toEqual(bh2.merkleRoot)
    expect(bh1.timestamp).toBe(bh2.timestamp)
    expect(bh1.target).toEqual(bh2.target)
    expect(bh1.nonce).toEqual(bh2.nonce)
    expect(bh1.nBlock).toBe(bh2.nBlock)
  })

  test('toBuffer', () => {
    const bh1 = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    const buf = bh1.toBuffer()
    const bh2 = BlockHeader.fromU8Vec(new Uint8Array(buf))
    expect(bh1.version).toBe(bh2.version)
    expect(bh1.prevBlockId).toEqual(bh2.prevBlockId)
    expect(bh1.merkleRoot).toEqual(bh2.merkleRoot)
    expect(bh1.timestamp).toBe(bh2.timestamp)
    expect(bh1.target).toEqual(bh2.target)
    expect(bh1.nonce).toEqual(bh2.nonce)
    expect(bh1.nBlock).toBe(bh2.nBlock)
  })

  test('isValid', () => {
    const bh1 = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    expect(bh1.isValid()).toBe(true)
  })

  test('isGenesis', () => {
    const bh1 = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    expect(bh1.isGenesis()).toBe(true)
  })

  test('hash', () => {
    const bh1 = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    expect(Buffer.from(bh1.hash()).toString('hex')).toBe(
      'ec821c0b0375d4e80eca5fb437652b2d53f32a613d4349d665a67406ba0d239e',
    )
  })

  test('id', () => {
    const bh1 = new BlockHeader(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
      new Uint8Array(32),
      new Uint8Array(32),
      0n,
    )
    expect(Buffer.from(bh1.id()).toString('hex')).toBe(
      '8bbebda6265eb4265ff52f6e744d2859e6ef58c640e1df355072c4a9541b8aba',
    )
  })

  describe('fromPrevBlockHeader', () => {
    test('fromPrevBlockHeader', () => {
      const prevBlockHeader = new BlockHeader(
        1,
        new Uint8Array(32),
        new Uint8Array(32),
        0n,
        new Uint8Array(32),
        new Uint8Array(32),
        0n,
      )
      const prevAdjustmentBlockHeader = null
      const bh = BlockHeader.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      )
      expect(bh.version).toBe(1)
      expect(bh.prevBlockId).toEqual(prevBlockHeader.id())
      expect(bh.merkleRoot).toEqual(new Uint8Array(32))
      expect(bh.timestamp).toBeLessThanOrEqual(new Date().getTime() / 1000)
      expect(bh.target).toEqual(new Uint8Array(32))
    })

    test('should correctly adjust the target if index is a multiple of BLOCKS_PER_ADJUSTMENT', () => {
      const prevBlockHeader = new BlockHeader(
        1,
        new Uint8Array(32),
        new Uint8Array(32),
        BlockHeader.BLOCKS_PER_ADJUSTMENT - 1n,
        new Uint8Array(32),
        new Uint8Array(32),
        BlockHeader.BLOCKS_PER_ADJUSTMENT - 1n,
      )
      const prevAdjustmentBlockHeader = new BlockHeader(
        1,
        new Uint8Array(32),
        new Uint8Array(32),
        0n,
        new Uint8Array(32),
        new Uint8Array(32),
        0n,
      )
      const bh = BlockHeader.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      )
      expect(bh.nBlock).toBe(BlockHeader.BLOCKS_PER_ADJUSTMENT)
      expect(bh.target).toEqual(
        BlockHeader.adjustTarget(new Uint8Array(32), 0n),
      )
    })

    test('should correctly adjust the target for non-trivial adjustment', () => {
      const initialTarget = Uint8Array.from(
        Buffer.from(
          '00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          'hex',
        ),
      )
      const timeDiff = (2016n * 600n) / 2n // One week
      const prevBlockHeader = new BlockHeader(
        1,
        new Uint8Array(32),
        new Uint8Array(32),
        timeDiff - 1n,
        initialTarget,
        new Uint8Array(32),
        BlockHeader.BLOCKS_PER_ADJUSTMENT - 1n,
      )
      const prevAdjustmentBlockHeader = new BlockHeader(
        1,
        new Uint8Array(32),
        new Uint8Array(32),
        0n,
        initialTarget,
        new Uint8Array(32),
        0n,
      )
      const bh = BlockHeader.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      )
      expect(bh.nBlock).toBe(BlockHeader.BLOCKS_PER_ADJUSTMENT)
      expect(Buffer.from(bh.target).toString('hex')).toEqual(
        '000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      )
    })
  })

  describe('adjustTarget', () => {
    test('adjustTarget', () => {
      const prevTarget = new Uint8Array(32)
      const timeDiff = 0n
      expect(BlockHeader.adjustTarget(prevTarget, timeDiff)).toEqual(
        new Uint8Array(32),
      )
    })

    it('should correctly adjust the target if timeDiff is less than one week', () => {
      const targetBuf = Buffer.from(
        '00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'hex',
      )
      const timeDiff = 2016n * 200n // Less than a week
      const newTarget = BlockHeader.adjustTarget(
        Uint8Array.from(targetBuf),
        timeDiff,
      )
      expect(Buffer.from(newTarget).toString('hex')).toBe(
        '000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      )
    })

    it('should correctly adjust the target if timeDiff is more than eight weeks', () => {
      const targetBuf = Buffer.from(
        '00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'hex',
      )
      const timeDiff = 2016n * 600n * 3n // More than four weeks
      const newTarget = BlockHeader.adjustTarget(
        Uint8Array.from(targetBuf),
        timeDiff,
      )
      expect(Buffer.from(newTarget).toString('hex')).toBe(
        '00000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffe',
      )
    })

    it('should correctly adjust the target if timeDiff is between one and eight weeks', () => {
      const targetBuf = Buffer.from(
        '00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'hex',
      )
      const timeDiff = 2016n * 600n // Two weeks
      const newTarget = BlockHeader.adjustTarget(
        Uint8Array.from(targetBuf),
        timeDiff,
      )
      expect(Buffer.from(newTarget).toString('hex')).toBe(
        '00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      )
    })
  })
})
