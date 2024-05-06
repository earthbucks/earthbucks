import { describe, expect, test, beforeEach, it } from "@jest/globals";
import TxOutput from "../src/tx-output";
import Script from "../src/script";
import IsoBufReader from "../src/iso-buf-reader";
import { Buffer } from "buffer";

describe("TxOutput", () => {
  describe("fromIsoBufReader", () => {
    test("fromIsoBufReader", () => {
      const value = BigInt(100);
      const script = new Script();
      const txOutput = new TxOutput(value, script);

      const reader = new IsoBufReader(txOutput.toIsoBuf());
      const result = TxOutput.fromIsoBufReader(reader);
      expect(result).toBeInstanceOf(TxOutput);
      expect(result.value).toEqual(value);
      expect(result.script.toIsoStr()).toEqual(script.toIsoStr());
    });
  });

  describe("fromU8Vec and toIsoBuf", () => {
    test("should create a TxOutput from a Buffer", () => {
      const value = BigInt(100);
      const script = Script.fromIsoStr(
        "DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL",
      );
      const txOutput = new TxOutput(value, script);
      const result = TxOutput.fromIsoBuf(txOutput.toIsoBuf());
      expect(txOutput.toIsoBuf().toString("hex")).toEqual(
        result.toIsoBuf().toString("hex"),
      );
    });

    test("big push data", () => {
      const data = "0x" + "00".repeat(0xffff);
      const value = BigInt(100);
      const script = Script.fromIsoStr(`${data} DOUBLEBLAKE3`);
      const txOutput = new TxOutput(value, script);
      const result = TxOutput.fromIsoBuf(txOutput.toIsoBuf());
      expect(txOutput.toIsoBuf().toString("hex")).toEqual(
        result.toIsoBuf().toString("hex"),
      );
    });
  });
});
