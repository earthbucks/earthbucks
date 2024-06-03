import { describe, expect, test, beforeEach, it } from "vitest";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { BufReader } from "../src/buf-reader.js";
import { SysBuf } from "../src/ebx-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("TxOutput", () => {
  describe("fromEbxBufReader", () => {
    test("fromEbxBufReader", () => {
      const value = new U64(100);
      const script = new Script();
      const txOutput = new TxOut(value, script);

      const reader = new BufReader(txOutput.toEbxBuf());
      const result = TxOut.fromEbxBufReader(reader);
      expect(result).toBeInstanceOf(TxOut);
      expect(result.value).toEqual(value);
      expect(result.script.toIsoStr()).toEqual(script.toIsoStr());
    });
  });

  describe("fromU8Vec and toEbxBuf", () => {
    test("should create a TxOutput from a EbxBuf", () => {
      const value = new U64(100);
      const script = Script.fromIsoStr(
        "DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL",
      );
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromEbxBuf(txOutput.toEbxBuf());
      expect(txOutput.toEbxBuf().toString("hex")).toEqual(
        result.toEbxBuf().toString("hex"),
      );
    });

    test("big push data", () => {
      const data = "0x" + "00".repeat(0xffff);
      const value = new U64(100);
      const script = Script.fromIsoStr(`${data} DOUBLEBLAKE3`);
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromEbxBuf(txOutput.toEbxBuf());
      expect(txOutput.toEbxBuf().toString("hex")).toEqual(
        result.toEbxBuf().toString("hex"),
      );
    });
  });
});
