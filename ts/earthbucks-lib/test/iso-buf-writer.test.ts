import { describe, expect, test, beforeEach, it } from "vitest";
import { IsoBufWriter } from "../src/iso-buf-writer.js";
import { IsoBuf } from "../src/iso-buf.js";

describe("IsoBufWriter", () => {
  let bufferWriter: IsoBufWriter;

  beforeEach(() => {
    bufferWriter = new IsoBufWriter();
  });

  describe("writeUInt8", () => {
    it("should write an unsigned 8-bit integer", () => {
      // Arrange
      const n: number = 123;

      // Act
      bufferWriter.writeUInt8(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result[0]).toBe(n);
    });
  });

  describe("writeUInt16BE", () => {
    it("should write an unsigned 16-bit integer in big-endian format", () => {
      // Arrange
      const n: number = 12345;

      // Act
      bufferWriter.writeUInt16BE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readUInt16BE(0)).toBe(n);
    });
  });

  describe("writeUInt32BE", () => {
    it("should write an unsigned 32-bit integer in big-endian format", () => {
      // Arrange
      const n: number = 1234567890;

      // Act
      bufferWriter.writeUInt32BE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readUInt32BE(0)).toBe(n);
    });
  });

  describe("writeUInt64BEBn", () => {
    it("should write an unsigned 64-bit integer in big-endian format", () => {
      // Arrange
      const bn: bigint = BigInt("1234567890123456789");

      // Act
      bufferWriter.writeUInt64BE(bn);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readBigInt64BE(0)).toBe(bn);
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
      expect(result.toString("hex")).toBe("fd3039");
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
      expect(result.toString("hex")).toBe("ff112210f47de98115");
    });
  });

  describe("varIntBufNum", () => {
    it("should write a number less than 253 as a single byte", () => {
      const n = 252;
      const result = IsoBufWriter.varIntBufNum(n);
      expect(result[0]).toBe(n);
    });

    it("should write a number less than 0x10000 as a 3-byte integer", () => {
      const n = 0xffff;
      const result = IsoBufWriter.varIntBufNum(n);
      expect(result[0]).toBe(253);
      expect(IsoBuf.from(result).readUInt16BE(1)).toBe(n);
    });

    it("should write a number less than 0x100000000 as a 5-byte integer", () => {
      const n = 0xffffffff;
      const result = IsoBufWriter.varIntBufNum(n);
      expect(result[0]).toBe(254);
      expect(IsoBuf.from(result).readUInt32BE(1)).toBe(n);
    });

    it("should write a number greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const n = 0x100000000;
      const result = IsoBufWriter.varIntBufNum(n);
      expect(result[0]).toBe(255);
      expect(IsoBuf.from(result).toString("hex")).toBe("ff0000000100000000");
    });
  });

  describe("varIntBufBigInt", () => {
    it("should write a bigint less than 253 as a single byte", () => {
      const bn = BigInt(252);
      const result = IsoBufWriter.varIntBuf(bn);
      expect(result[0]).toBe(Number(bn));
    });

    it("should write a bigint less than 0x10000 as a 3-byte integer", () => {
      const bn = BigInt(0xffff);
      const result = IsoBufWriter.varIntBuf(bn);
      expect(result[0]).toBe(253);
      expect((result[1] << 8) | result[2]).toBe(Number(bn));
    });

    it("should write a bigint less than 0x100000000 as a 5-byte integer", () => {
      const bn = BigInt(0xffffffff);
      const result = IsoBufWriter.varIntBuf(bn);
      expect(result[0]).toBe(254);
      expect(IsoBuf.from(result).toString("hex")).toBe("feffffffff");
    });

    it("should write a bigint greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const bn = BigInt("0x100000000");
      const result = IsoBufWriter.varIntBuf(bn);
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
