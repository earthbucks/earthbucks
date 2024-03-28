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

  describe('fromBigInt', () => {
    it('should create a VarInt from a bigint', () => {
      // Arrange
      const bn: bigint = BigInt(123)

      // Act
      varInt.fromBigInt(bn)

      // Assert
      expect(varInt.toBigInt()).toBe(bn)
    })
  })

  describe('static fromBigInt', () => {
    it('should create a VarInt from a bigint', () => {
      // Arrange
      const bn: bigint = BigInt(123)

      // Act
      varInt = VarInt.fromBigInt(bn)

      // Assert
      expect(varInt.toBigInt()).toBe(bn)
    })
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

  describe('static fromNumber', () => {
    it('should create a VarInt from a number', () => {
      // Arrange
      const n: number = 123

      // Act
      varInt = VarInt.fromNumber(n)

      // Assert
      expect(varInt.toNumber()).toBe(n)
    })
  })

  describe('toUint8Array', () => {
    it('should return a Uint8Array', () => {
      // Arrange
      const n: number = 123

      // Act
      varInt.fromNumber(n)

      // Assert
      expect(varInt.toUint8Array()).toBeInstanceOf(Uint8Array)
    })
  })

  describe('toBuffer', () => {
    it('should return a Buffer', () => {
      // Arrange
      const n: number = 123

      // Act
      varInt.fromNumber(n)

      // Assert
      expect(varInt.toBuffer()).toBeInstanceOf(Buffer)
    })
  })

  describe('toBigInt', () => {
    it('should return a bigint', () => {
      // Arrange
      const bn: bigint = BigInt(123)

      // Act
      varInt.fromBigInt(bn)

      // Assert
      expect(varInt.toBigInt()).toBe(BigInt(123))
    })
  })

  describe('toNumber', () => {
    it('should return a number', () => {
      // Arrange
      const n: number = 123

      // Act
      varInt.fromNumber(n)

      // Assert
      expect(varInt.toNumber()).toBe(123)
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
