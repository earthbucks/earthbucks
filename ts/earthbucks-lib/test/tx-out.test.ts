import { describe, expect, test, beforeEach, it } from "vitest";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { IsoBufReader } from "../src/iso-buf-reader.js";
import { SysBuf } from "../src/iso-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("TxOutput", () => {
  describe("fromIsoBufReader", () => {
    test("fromIsoBufReader", () => {
      const value = new U64(100);
      const script = new Script();
      const txOutput = new TxOut(value, script);

      const reader = new IsoBufReader(txOutput.toIsoBuf());
      const result = TxOut.fromIsoBufReader(reader);
      expect(result).toBeInstanceOf(TxOut);
      expect(result.value).toEqual(value);
      expect(result.script.toIsoStr()).toEqual(script.toIsoStr());
    });
  });

  describe("fromU8Vec and toIsoBuf", () => {
    test("should create a TxOutput from a IsoBuf", () => {
      const value = new U64(100);
      const script = Script.fromIsoStr(
        "DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL",
      );
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromIsoBuf(txOutput.toIsoBuf());
      expect(txOutput.toIsoBuf().toString("hex")).toEqual(
        result.toIsoBuf().toString("hex"),
      );
    });

    test("big push data", () => {
      const data = "0x" + "00".repeat(0xffff);
      const value = new U64(100);
      const script = Script.fromIsoStr(`${data} DOUBLEBLAKE3`);
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromIsoBuf(txOutput.toIsoBuf());
      expect(txOutput.toIsoBuf().toString("hex")).toEqual(
        result.toIsoBuf().toString("hex"),
      );
    });
  });
});
