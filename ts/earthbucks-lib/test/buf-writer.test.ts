import { describe, expect, test, beforeEach, it } from "vitest";
import { BufWriter } from "../src/buf-writer.js";
import { SysBuf } from "../src/ebx-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("BufWriter", () => {
  let bufferWriter: BufWriter;

  beforeEach(() => {
    bufferWriter = new BufWriter();
  });

  describe("writeUInt8", () => {
    it("should write an unsigned 8-bit integer", () => {
      const u8: U8 = new U8(123);
      bufferWriter.writeU8(u8);
      const result = bufferWriter.toBuf();
      expect(result[0]).toEqual(u8.n);
    });
  });

  describe("writeUInt16BE", () => {
    it("should write an unsigned 16-bit integer in big-endian format", () => {
      const u16: U16 = new U16(12345);
      bufferWriter.writeU16BE(u16);
      const result = bufferWriter.toBuf();
      expect(result.readUInt16BE(0)).toEqual(u16.n);
    });
  });

  describe("writeUInt32BE", () => {
    it("should write an unsigned 32-bit integer in big-endian format", () => {
      const u32: U32 = new U32(1234567890);
      bufferWriter.writeU32BE(u32);
      const result = bufferWriter.toBuf();
      expect(result.readUInt32BE(0)).toEqual(u32.n);
    });
  });

  describe("writeUInt64BEBn", () => {
    it("should write an unsigned 64-bit integer in big-endian format", () => {
      const u64: U64 = new U64(1234567890123456789n);
      bufferWriter.writeU64BE(u64);
      const result = bufferWriter.toBuf();
      expect(result.readBigInt64BE(0)).toEqual(u64.bn);
    });
  });

  describe("writeVarInt", () => {
    it("should write a variable length bigint", () => {
      const bn: U64 = new U64(1234567890123456789n);
      bufferWriter.writeVarInt(bn);
      const result = bufferWriter.toBuf();
      expect(result.toString("hex")).toBe("ff112210f47de98115");
    });
  });

  describe("varIntBufBigInt", () => {
    it("should write a bigint less than 253 as a single byte", () => {
      const bn = new U64(252);
      const result = BufWriter.varIntBuf(bn);
      expect(result[0]).toBe(bn.n);
    });

    it("should write a bigint less than 0x10000 as a 3-byte integer", () => {
      const bn = new U64(0xffff);
      const result = BufWriter.varIntBuf(bn);
      expect(result[0]).toBe(253);
      expect((result[1] << 8) | result[2]).toBe(bn.n);
    });

    it("should write a bigint less than 0x100000000 as a 5-byte integer", () => {
      const bn = new U64(0xffffffff);
      const result = BufWriter.varIntBuf(bn);
      expect(result[0]).toBe(254);
      expect(SysBuf.from(result).toString("hex")).toBe("feffffffff");
    });

    it("should write a bigint greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const u64 = new U64(0x100000000n);
      const result = BufWriter.varIntBuf(u64);
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
      expect(readBn).toBe(u64.bn);
    });
  });
});
