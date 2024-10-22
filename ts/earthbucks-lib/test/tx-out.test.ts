import { describe, expect, test, beforeEach, it } from "vitest";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { BufReader } from "../src/buf-reader.js";
import { WebBuf } from "../src/buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("TxOutput", () => {
  describe("fromBufReader", () => {
    test("fromBufReader", () => {
      const value = new U64(100);
      const script = new Script();
      const txOutput = new TxOut(value, script);

      const reader = new BufReader(txOutput.toBuf());
      const result = TxOut.fromBufReader(reader);
      expect(result).toBeInstanceOf(TxOut);
      expect(result.value).toEqual(value);
      expect(result.script.toString()).toEqual(script.toString());
    });
  });

  describe("fromU8Vec and toBuf", () => {
    test("should create a TxOutput from a EbxBuf", () => {
      const value = new U64(100);
      const script = Script.fromString(
        "DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL",
      );
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromBuf(txOutput.toBuf());
      expect(txOutput.toBuf().toString("hex")).toEqual(
        result.toBuf().toString("hex"),
      );
    });

    test("big push data", () => {
      const data = `0x${"00".repeat(0xffff)}`;
      const value = new U64(100);
      const script = Script.fromString(`${data} DOUBLEBLAKE3`);
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromBuf(txOutput.toBuf());
      expect(txOutput.toBuf().toString("hex")).toEqual(
        result.toBuf().toString("hex"),
      );
    });
  });
});
