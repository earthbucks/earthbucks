import { describe, expect, test, beforeEach, it } from "vitest";
import { TxOut } from "../src/tx-out.ts";
import { Script } from "../src/script.ts";
import { IsoBufReader } from "../src/iso-buf-reader.ts";
import { Buffer } from "buffer";

describe("TxOutput", () => {
  describe("fromIsoBufReader", () => {
    test("fromIsoBufReader", () => {
      const value = BigInt(100);
      const script = new Script();
      const txOutput = new TxOut(value, script);

      const reader = new IsoBufReader(txOutput.toIsoBuf());
      const result = TxOut.fromIsoBufReader(reader).unwrap();
      expect(result).toBeInstanceOf(TxOut);
      expect(result.value).toEqual(value);
      expect(result.script.toIsoStr()).toEqual(script.toIsoStr());
    });
  });

  describe("fromU8Vec and toIsoBuf", () => {
    test("should create a TxOutput from a Buffer", () => {
      const value = BigInt(100);
      const script = Script.fromIsoStr(
        "DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL",
      ).unwrap();
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromIsoBuf(txOutput.toIsoBuf()).unwrap();
      expect(txOutput.toIsoBuf().toString("hex")).toEqual(
        result.toIsoBuf().toString("hex"),
      );
    });

    test("big push data", () => {
      const data = "0x" + "00".repeat(0xffff);
      const value = BigInt(100);
      const script = Script.fromIsoStr(`${data} DOUBLEBLAKE3`).unwrap();
      const txOutput = new TxOut(value, script);
      const result = TxOut.fromIsoBuf(txOutput.toIsoBuf()).unwrap();
      expect(txOutput.toIsoBuf().toString("hex")).toEqual(
        result.toIsoBuf().toString("hex"),
      );
    });
  });
});
