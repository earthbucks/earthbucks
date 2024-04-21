import { describe, expect, test, beforeEach, it } from "@jest/globals";
import TxOutput from "../src/tx-output";
import Script from "../src/script";
import BufferReader from "../src/buffer-reader";
import { Buffer } from "buffer";

describe("TxOutput", () => {
  describe("fromBufferReader", () => {
    test("fromBufferReader", () => {
      const value = BigInt(100);
      const script = new Script();
      const txOutput = new TxOutput(value, script);

      const reader = new BufferReader(txOutput.toBuffer());
      const result = TxOutput.fromBufferReader(reader);
      expect(result).toBeInstanceOf(TxOutput);
      expect(result.value).toEqual(value);
      expect(result.script.toString()).toEqual(script.toString());
    });
  });

  describe("fromU8Vec and toU8Vec", () => {
    test("should create a TxOutput from a Uint8Array", () => {
      const value = BigInt(100);
      const script = Script.fromString(
        "DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL",
      );
      const txOutput = new TxOutput(value, script);
      const result = TxOutput.fromU8Vec(txOutput.toU8Vec());
      expect(txOutput.toBuffer().toString("hex")).toEqual(
        result.toBuffer().toString("hex"),
      );
    });

    test("big push data", () => {
      const data = "0x" + "00".repeat(0xffff);
      const value = BigInt(100);
      const script = Script.fromString(`${data} DOUBLEBLAKE3`);
      const txOutput = new TxOutput(value, script);
      const result = TxOutput.fromU8Vec(txOutput.toU8Vec());
      expect(txOutput.toBuffer().toString("hex")).toEqual(
        result.toBuffer().toString("hex"),
      );
    });
  });
});
