import { describe, expect, test, beforeEach, it } from "vitest";
import { Writer } from "../src/writer.js";

describe("IsoBufWriter", () => {
  let bufferWriter: Writer;

  beforeEach(() => {
    bufferWriter = new Writer();
  });

  describe("writeU8", () => {
    it("should write an unsigned 8-bit integer", () => {
      // Arrange
      const n: number = 123;

      // Act
      bufferWriter.writeU8(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result[0]).toBe(n);
    });
  });

  describe("writeU16BE", () => {
    it("should write an unsigned 16-bit integer in big-endian format", () => {
      // Arrange
      const n: number = 12345;

      // Act
      bufferWriter.writeU16BE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readU16BE(0).unwrap()).toBe(n);
    });
  });

  describe("writeU32BE", () => {
    it("should write an unsigned 32-bit integer in big-endian format", () => {
      // Arrange
      const n: number = 1234567890;

      // Act
      bufferWriter.writeU32BE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readU32BE(0).unwrap()).toBe(n);
    });
  });

  describe("writeU64BEBn", () => {
    it("should write an unsigned 64-bit integer in big-endian format", () => {
      // Arrange
      const bn: bigint = BigInt("1234567890123456789");

      // Act
      bufferWriter.writeU64BE(bn);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readU64BE(0).unwrap()).toBe(bn);
    });
  });

  describe("writeVarIntNum", () => {
    it("should write a variable length integer", () => {
      // Arrange
      const n: number = 12345;

      // Act
      bufferWriter.writeVarIntNum(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.toStrictHex()).toBe("fd3039");
    });
  });

  describe("writeVarIntBn", () => {
    it("should write a variable length bigint", () => {
      // Arrange
      const bn: bigint = BigInt("1234567890123456789");

      // Act
      bufferWriter.writeVarInt(bn);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.toStrictHex()).toBe("ff112210f47de98115");
    });
  });

  describe("varIntBufNum", () => {
    it("should write a number less than 253 as a single byte", () => {
      const n = 252;
      const result = Writer.varIntBufNum(n);
      expect(result[0]).toBe(n);
    });

    it("should write a number less than 0x10000 as a 3-byte integer", () => {
      const n = 0xffff;
      const result = Writer.varIntBufNum(n);
      expect(result[0]).toBe(253);
      expect(result.readU16BE(1).unwrap()).toBe(n);
    });

    it("should write a number less than 0x100000000 as a 5-byte integer", () => {
      const n = 0xffffffff;
      const result = Writer.varIntBufNum(n);
      expect(result[0]).toBe(254);
      expect(result.readU32BE(1).unwrap()).toBe(n);
    });

    it("should write a number greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const n = 0x100000000;
      const result = Writer.varIntBufNum(n);
      expect(result[0]).toBe(255);
      expect(result.toStrictHex()).toBe("ff0000000100000000");
    });
  });

  describe("varIntBufBigInt", () => {
    it("should write a bigint less than 253 as a single byte", () => {
      const bn = BigInt(252);
      const result = Writer.varIntBuf(bn);
      expect(result[0]).toBe(Number(bn));
    });

    it("should write a bigint less than 0x10000 as a 3-byte integer", () => {
      const bn = BigInt(0xffff);
      const result = Writer.varIntBuf(bn);
      expect(result[0]).toBe(253);
      expect((result[1] << 8) | result[2]).toBe(Number(bn));
    });

    it("should write a bigint less than 0x100000000 as a 5-byte integer", () => {
      const bn = BigInt(0xffffffff);
      const result = Writer.varIntBuf(bn);
      expect(result[0]).toBe(254);
      expect(result.toStrictHex()).toBe("feffffffff");
    });

    it("should write a bigint greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const bn = BigInt("0x100000000");
      const result = Writer.varIntBuf(bn);
      expect(result[0]).toBe(255);
      const readBn =
        (BigInt(result[1]) << 56n) |
        (BigInt(result[2]) << 48n) |
        (BigInt(result[3]) << 40n) |
        (BigInt(result[4]) << 32n) |
        (BigInt(result[5]) << 24n) |
        (BigInt(result[6]) << 16n) |
        (BigInt(result[7]) << 8n) |
        BigInt(result[8]);
      expect(readBn).toBe(bn);
    });
  });
});
