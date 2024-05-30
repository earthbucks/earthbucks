import { describe, expect, test, beforeEach, it } from "vitest";
import { VarInt } from "../src/var-int";
import { IsoBuf } from "../src/iso-buf.js";

describe("VarInt", () => {
  let varInt: VarInt;

  beforeEach(() => {
    varInt = new VarInt();
  });

  describe("fromNumber", () => {
    it("should create a VarInt from a number", () => {
      const n: number = 123;
      varInt = VarInt.fromNumber(n);
      expect(varInt.toNumber().unwrap()).toBe(n);
    });
  });

  describe("static fromBigInt", () => {
    it("should create a VarInt from a bigint", () => {
      const bn: bigint = BigInt(123);
      varInt = VarInt.fromBigInt(bn);
      expect(varInt.toBigInt().unwrap()).toBe(bn);
    });
  });

  describe("static fromNumber", () => {
    it("should create a VarInt from a number", () => {
      const n: number = 123;
      varInt = VarInt.fromNumber(n);
      expect(varInt.toNumber().unwrap()).toBe(n);
    });
  });

  describe("toIsoBuf", () => {
    it("should return a IsoBuf", () => {
      const n: number = 123;
      varInt = VarInt.fromNumber(n);
      expect(varInt.toIsoBuf().toString("hex")).toEqual("7b");
    });
  });

  describe("toBigInt", () => {
    it("should return a bigint", () => {
      const bn: bigint = BigInt(123);
      varInt = VarInt.fromBigInt(bn);
      expect(varInt.toBigInt().unwrap()).toBe(BigInt(123));
    });
  });

  describe("toNumber", () => {
    it("should return a number", () => {
      const n: number = 123;
      varInt = VarInt.fromNumber(n);
      expect(varInt.toNumber().unwrap()).toBe(123);
    });
  });

  describe("isMinimal", () => {
    it("should return true if the VarInt is minimal", () => {
      const bn: bigint = BigInt(123);
      varInt = VarInt.fromBigInt(bn);
      expect(varInt.isMinimal()).toBe(true);
    });

    it("should return false if the VarInt is not minimal", () => {
      const bn: bigint = BigInt(0xff);
      varInt = new VarInt(IsoBuf.from([0xfd, 0x00, 0x00]));
      expect(varInt.isMinimal()).toBe(false);
    });
  });
});
