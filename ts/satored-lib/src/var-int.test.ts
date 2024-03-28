import { describe, expect, test, beforeEach, it } from '@jest/globals'
import VarInt from './var-int'

describe('VarInt', () => {
  let varInt: VarInt

  beforeEach(() => {
    varInt = new VarInt()
  })

  describe('fromNumber', () => {
    it('should create a VarInt from a number', () => {
      // Arrange
      const n: number = 123

      // Act
      varInt.fromNumber(n)

      // Assert
      expect(varInt.toNumber()).toBe(n)
    })
  })

  describe('fromBn', () => {
    it('should create a VarInt from a bigint', () => {
      // Arrange
      const bn: bigint = BigInt(123)

      // Act
      varInt.fromBigInt(bn)

      // Assert
      expect(varInt.toBn()).toBe(bn)
    })
  })

  describe('isMinimal', () => {
    it('should return true if the VarInt is minimal', () => {
      // Arrange
      const bn: bigint = BigInt(123)

      // Act
      varInt.fromBigInt(bn)

      // Assert
      expect(varInt.isMinimal()).toBe(true)
    })

    it('should return false if the VarInt is not minimal', () => {
      // Arrange
      const bn: bigint = BigInt(0xff)

      // Act
      varInt = new VarInt(Buffer.from([0xfd, 0x00, 0x00]))

      // Assert
      expect(varInt.isMinimal()).toBe(false)
    })
  })
})