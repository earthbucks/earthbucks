import { describe, expect, test, beforeEach, it } from "vitest";
import { VarInt } from "../src/var-int";
import { EbxBuffer } from "../src/ebx-buffer";

describe("VarInt", () => {
  let varInt: VarInt;

  beforeEach(() => {
    varInt = new VarInt();
  });

  describe("fromNumber", () => {
    it("should create a VarInt from a number", () => {
      // Arrange
      const n: number = 123;

      // Act
      varInt.fromNumber(n);

      // Assert
      expect(varInt.toNumber().unwrap()).toBe(n);
    });
  });

  describe("fromBigInt", () => {
    it("should create a VarInt from a bigint", () => {
      // Arrange
      const bn: bigint = BigInt(123);

      // Act
      varInt.fromBigInt(bn);

      // Assert
      expect(varInt.toBigInt().unwrap()).toBe(bn);
    });
  });

  describe("static fromBigInt", () => {
    it("should create a VarInt from a bigint", () => {
      // Arrange
      const bn: bigint = BigInt(123);

      // Act
      varInt = VarInt.fromBigInt(bn);

      // Assert
      expect(varInt.toBigInt().unwrap()).toBe(bn);
    });
  });

  describe("fromNumber", () => {
    it("should create a VarInt from a number", () => {
      // Arrange
      const n: number = 123;

      // Act
      varInt.fromNumber(n);

      // Assert
      expect(varInt.toNumber().unwrap()).toBe(n);
    });
  });

  describe("static fromNumber", () => {
    it("should create a VarInt from a number", () => {
      // Arrange
      const n: number = 123;

      // Act
      varInt = VarInt.fromNumber(n);

      // Assert
      expect(varInt.toNumber().unwrap()).toBe(n);
    });
  });

  describe("toIsoBuf", () => {
    it("should return a EbxBuffer", () => {
      // Arrange
      const n: number = 123;

      // Act
      varInt.fromNumber(n);

      // Assert
      expect(varInt.toIsoBuf()).toBeInstanceOf(EbxBuffer);
    });
  });

  describe("toIsoBuf", () => {
    it("should return a EbxBuffer", () => {
      // Arrange
      const n: number = 123;

      // Act
      varInt.fromNumber(n);

      // Assert
      expect(varInt.toIsoBuf()).toBeInstanceOf(EbxBuffer);
    });
  });

  describe("toBigInt", () => {
    it("should return a bigint", () => {
      // Arrange
      const bn: bigint = BigInt(123);

      // Act
      varInt.fromBigInt(bn);

      // Assert
      expect(varInt.toBigInt().unwrap()).toBe(BigInt(123));
    });
  });

  describe("toNumber", () => {
    it("should return a number", () => {
      // Arrange
      const n: number = 123;

      // Act
      varInt.fromNumber(n);

      // Assert
      expect(varInt.toNumber().unwrap()).toBe(123);
    });
  });

  describe("isMinimal", () => {
    it("should return true if the VarInt is minimal", () => {
      // Arrange
      const bn: bigint = BigInt(123);

      // Act
      varInt.fromBigInt(bn);

      // Assert
      expect(varInt.isMinimal()).toBe(true);
    });

    it("should return false if the VarInt is not minimal", () => {
      // Arrange
      const bn: bigint = BigInt(0xff);

      // Act
      varInt = new VarInt(EbxBuffer.from([0xfd, 0x00, 0x00]));

      // Assert
      expect(varInt.isMinimal()).toBe(false);
    });
  });
});
