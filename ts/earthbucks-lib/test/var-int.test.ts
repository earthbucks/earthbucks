import { describe, expect, test, beforeEach, it } from "vitest";
import { VarInt } from "../src/var-int.js";
import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

describe("VarInt", () => {
  let varInt: VarInt;

  beforeEach(() => {
    varInt = new VarInt();
  });

  describe("fromNumber", () => {
    it("should create a VarInt from a number", () => {
      const u32: U32BE = new U32BE(123);
      varInt = VarInt.fromU32(u32);
      expect(varInt.toU32().bn.toString()).toEqual(u32.bn.toString());
    });
  });

  describe("static fromBigInt", () => {
    it("should create a VarInt from a bigint", () => {
      const u64: U64BE = new U64BE(123);
      varInt = VarInt.fromU64(u64);
      expect(varInt.toU64().bn.toString()).toEqual(u64.bn.toString());
    });
  });

  describe("static fromNumber", () => {
    it("should create a VarInt from a number", () => {
      const u32: U32BE = new U32BE(123);
      varInt = VarInt.fromU32(u32);
      expect(varInt.toU32().bn.toString()).toEqual(u32.bn.toString());
    });
  });

  describe("toBuf", () => {
    it("should return a EbxBuf", () => {
      const u32: U32BE = new U32BE(123);
      varInt = VarInt.fromU32(u32);
      expect(varInt.toBuf().toString("hex")).toEqual("7b");
    });
  });

  describe("toBigInt", () => {
    it("should return a bigint", () => {
      const u64: U64BE = new U64BE(123);
      varInt = VarInt.fromU64(u64);
      expect(varInt.toU64().bn.toString()).toEqual(BigInt(123).toString());
    });
  });

  describe("toNumber", () => {
    it("should return a number", () => {
      const u32: U32BE = new U32BE(123);
      varInt = VarInt.fromU32(u32);
      expect(varInt.toU32().bn.toString()).toEqual("123");
    });
  });

  describe("isMinimal", () => {
    it("should return true if the VarInt is minimal", () => {
      const bn: U64BE = new U64BE(123);
      varInt = VarInt.fromU64(bn);
      expect(varInt.isMinimal()).toBe(true);
    });

    it("should return false if the VarInt is not minimal", () => {
      const bn: U64BE = new U64BE(0xff);
      varInt = new VarInt(WebBuf.from([0xfd, 0x00, 0x00]));
      expect(varInt.isMinimal()).toBe(false);
    });
  });
});
