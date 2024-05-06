import { describe, expect, test, beforeEach, it } from "@jest/globals";
import IsoBufWriter from "../src/iso-buf-writer";
import { Buffer } from "buffer";

describe("BufferWriter", () => {
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

  describe("writeInt8", () => {
    it("should write a signed 8-bit integer", () => {
      // Arrange
      const n: number = -123;

      // Act
      bufferWriter.writeInt8(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readInt8(0)).toBe(n);
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

  describe("writeInt16BE", () => {
    it("should write a signed 16-bit integer in big-endian format", () => {
      // Arrange
      const n: number = -12345;

      // Act
      bufferWriter.writeInt16BE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readInt16BE(0)).toBe(n);
    });
  });

  describe("writeUInt16LE", () => {
    it("should write an unsigned 16-bit integer in little-endian format", () => {
      // Arrange
      const n: number = 12345;

      // Act
      bufferWriter.writeUInt16LE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readUInt16LE(0)).toBe(n);
    });
  });

  describe("writeInt16LE", () => {
    it("should write a signed 16-bit integer in little-endian format", () => {
      // Arrange
      const n: number = -12345;

      // Act
      bufferWriter.writeInt16LE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readInt16LE(0)).toBe(n);
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

  describe("writeInt32BE", () => {
    it("should write a signed 32-bit integer in big-endian format", () => {
      // Arrange
      const n: number = -1234567890;

      // Act
      bufferWriter.writeInt32BE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readInt32BE(0)).toBe(n);
    });
  });

  describe("writeUInt32LE", () => {
    it("should write an unsigned 32-bit integer in little-endian format", () => {
      // Arrange
      const n: number = 1234567890;

      // Act
      bufferWriter.writeUInt32LE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readUInt32LE(0)).toBe(n);
    });
  });

  describe("writeInt32LE", () => {
    it("should write a signed 32-bit integer in little-endian format", () => {
      // Arrange
      const n: number = -1234567890;

      // Act
      bufferWriter.writeInt32LE(n);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readInt32LE(0)).toBe(n);
    });
  });

  describe("writeUInt64BEBn", () => {
    it("should write an unsigned 64-bit integer in big-endian format", () => {
      // Arrange
      const bn: bigint = BigInt("1234567890123456789");

      // Act
      bufferWriter.writeUInt64BEBigInt(bn);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readBigInt64BE(0)).toBe(bn);
    });
  });

  describe("writeUInt64LEBn", () => {
    it("should write an unsigned 64-bit integer in little-endian format", () => {
      // Arrange
      const bn: bigint = BigInt("1234567890123456789");

      // Act
      bufferWriter.writeUInt64LEBigInt(bn);

      // Assert
      const result = bufferWriter.toIsoBuf();
      expect(result.readBigInt64LE(0)).toBe(bn);
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
      bufferWriter.writeVarIntBigInt(bn);

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
      expect(Buffer.from(result).readUInt16BE(1)).toBe(n);
    });

    it("should write a number less than 0x100000000 as a 5-byte integer", () => {
      const n = 0xffffffff;
      const result = IsoBufWriter.varIntBufNum(n);
      expect(result[0]).toBe(254);
      expect(Buffer.from(result).readUInt32BE(1)).toBe(n);
    });

    it("should write a number greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const n = 0x100000000;
      const result = IsoBufWriter.varIntBufNum(n);
      expect(result[0]).toBe(255);
      expect(Buffer.from(result).readUInt32BE(1)).toBe(n & -1);
      expect(Buffer.from(result).readUInt32BE(5)).toBe(
        Math.floor(n / 0x100000000),
      );
    });
  });

  describe("varIntBufBigInt", () => {
    it("should write a bigint less than 253 as a single byte", () => {
      const bn = BigInt(252);
      const result = IsoBufWriter.varIntBufBigInt(bn);
      expect(result[0]).toBe(Number(bn));
    });

    it("should write a bigint less than 0x10000 as a 3-byte integer", () => {
      const bn = BigInt(0xffff);
      const result = IsoBufWriter.varIntBufBigInt(bn);
      expect(result[0]).toBe(253);
      expect((result[1] << 8) | result[2]).toBe(Number(bn));
    });

    it("should write a bigint less than 0x100000000 as a 5-byte integer", () => {
      const bn = BigInt(0xffffffff);
      const result = IsoBufWriter.varIntBufBigInt(bn);
      expect(result[0]).toBe(254);
      expect(Buffer.from(result).toString("hex")).toBe("feffffffff");
    });

    it("should write a bigint greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const bn = BigInt("0x100000000");
      const result = IsoBufWriter.varIntBufBigInt(bn);
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
