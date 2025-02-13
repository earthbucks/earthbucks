import { beforeEach, describe, it, test, expect } from "vitest";
import { BufWriter } from "../src/buf-writer.js";
import { BufReader } from "../src/buf-reader.js";
import { U8, U16BE, U32BE, U64BE, U128BE, U256BE } from "@webbuf/numbers";
import { WebBuf } from "@webbuf/webbuf";

describe("BufWriter", () => {
  it("should exist", () => {
    expect(BufWriter).toBeDefined();
  });

  let bufferWriter: BufWriter;

  beforeEach(() => {
    bufferWriter = new BufWriter();
  });

  describe("writeUint8", () => {
    it("should write an unsigned 8-bit integer", () => {
      const u8: U8 = U8.fromN(123);
      bufferWriter.writeU8(u8);
      const result = bufferWriter.toBuf();
      expect(result[0]).toEqual(u8.n);
    });
  });

  describe("writeUint16BE", () => {
    it("should write an unsigned 16-bit integer in big-endian format", () => {
      const u16: U16BE = U16BE.fromN(12345);
      bufferWriter.writeU16BE(u16);
      const result = bufferWriter.toBuf();
      expect(new BufReader(result).readU16BE().n).toEqual(u16.n);
    });
  });

  describe("writeUint32BE", () => {
    it("should write an unsigned 32-bit integer in big-endian format", () => {
      const u32: U32BE = U32BE.fromN(1234567890);
      bufferWriter.writeU32BE(u32);
      const result = bufferWriter.toBuf();
      expect(new BufReader(result).readU32BE().n).toEqual(u32.n);
    });
  });

  describe("writeUint64BE", () => {
    it("should write an unsigned 64-bit integer in big-endian format", () => {
      const u64: U64BE = U64BE.fromBn(1234567890123456789n);
      bufferWriter.writeU64BE(u64);
      const result = bufferWriter.toBuf();
      expect(new BufReader(result).readU64BE().bn).toEqual(u64.bn);
    });
  });

  describe("writeUint128BE", () => {
    it("should write an unsigned 128-bit integer in big-endian format", () => {
      const u128: U128BE = U128BE.fromBn(0x0123456789abcdef0123456789abcdefn);
      bufferWriter.writeU128BE(u128);
      const result = bufferWriter.toBuf();
      expect(new BufReader(result).readU128BE().bn).toEqual(u128.bn);
    });
  });

  describe("writeUint256BE", () => {
    it("should write an unsigned 256-bit integer in big-endian format", () => {
      const u256: U256BE =
        U256BE.fromBn(
          0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdefn,
        );
      bufferWriter.writeU256BE(u256);
      const result = bufferWriter.toBuf();
      expect(new BufReader(result).readU256BE().bn).toEqual(u256.bn);
    });
  });

  describe("writeVarInt", () => {
    it("should write a variable length bigint", () => {
      const bn: U64BE = U64BE.fromBn(1234567890123456789n);
      bufferWriter.writeVarIntU64BE(bn);
      const result = bufferWriter.toBuf();
      expect(result.toString("hex")).toBe("ff112210f47de98115");
    });
  });

  describe("varIntBufBigInt", () => {
    it("should write a bigint less than 253 as a single byte", () => {
      const bn = U64BE.fromN(252);
      const result = BufWriter.varIntU64BEBuf(bn);
      expect(result[0]).toBe(bn.n);
    });

    it("should write a bigint less than 0x10000 as a 3-byte integer", () => {
      const bn = U64BE.fromN(0xffff);
      const result = BufWriter.varIntU64BEBuf(bn);
      expect(result[0]).toBe(253);
      expect(result[1] && result[2] && (result[1] << 8) | result[2]).toBe(bn.n);
    });

    it("should write a bigint less than 0x100000000 as a 5-byte integer", () => {
      const bn = U64BE.fromN(0xffffffff);
      const result = BufWriter.varIntU64BEBuf(bn);
      expect(result[0]).toBe(254);
      expect(WebBuf.from(result).toString("hex")).toBe("feffffffff");
    });

    it("should write a bigint greater than or equal to 0x100000000 as a 9-byte integer", () => {
      const u64 = U64BE.fromBn(0x100000000n);
      const result = BufWriter.varIntU64BEBuf(u64);
      expect(result[0]).toBe(255);
      const readBn =
        (BigInt(result[1] || 0) << 56n) |
        (BigInt(result[2] || 0) << 48n) |
        (BigInt(result[3] || 0) << 40n) |
        (BigInt(result[4] || 0) << 32n) |
        (BigInt(result[5] || 0) << 24n) |
        (BigInt(result[6] || 0) << 16n) |
        (BigInt(result[7] || 0) << 8n) |
        BigInt(result[8] || 0);
      expect(readBn).toBe(u64.bn);
    });
  });
});
