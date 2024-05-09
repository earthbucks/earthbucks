import { describe, expect, test, beforeEach, it } from "@jest/globals";
import TxInput from "../src/tx-input";
import Script from "../src/script";
import IsoBufReader from "../src/iso-buf-reader";
import { Buffer } from "buffer";

describe("TxInput", () => {
  test("should create a TxInput", () => {
    const inputTxHash = Buffer.alloc(32);
    const inputTxIndex = 0;
    const script = new Script();
    const lockRel = 0xffffffff;

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput).toBeInstanceOf(TxInput);
    expect(txInput.inputTxId).toBe(inputTxHash);
    expect(txInput.inputTxNOut).toBe(inputTxIndex);
    expect(txInput.script).toBe(script);
    expect(txInput.lockRel).toBe(lockRel);
  });

  describe("fromIsoBufReader", () => {
    test("fromIsoBufReader", () => {
      const inputTxHash = Buffer.alloc(32);
      const inputTxIndex = 0;
      const script = new Script();
      const lockRel = 0xffffffff;

      const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);

      const reader = new IsoBufReader(txInput.toIsoBuf());
      const result = TxInput.fromIsoBufReader(reader);
      expect(result).toBeInstanceOf(TxInput);
      expect(Buffer.from(result.inputTxId).toString("hex")).toEqual(
        Buffer.from(inputTxHash).toString("hex"),
      );
      expect(result.inputTxNOut).toEqual(inputTxIndex);
      expect(result.script.toIsoStr()).toEqual(script.toIsoStr());
      expect(result.lockRel).toEqual(lockRel);
    });
  });

  describe("toIsoBuf", () => {
    test("toIsoBuf", () => {
      const inputTxHash = Buffer.alloc(32);
      const inputTxIndex = 0;
      const script = new Script();
      const lockRel = 0xffffffff;

      const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);
      const result = txInput.toIsoBuf();
      expect(result.toString("hex")).toEqual(
        "00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff",
      );
    });

    test("toIsoBuf with script", () => {
      const inputTxHash = Buffer.alloc(32);
      const inputTxIndex = 0;
      const script = Script.fromIsoStr("DOUBLEBLAKE3").unwrap();
      const lockRel = 0xffffffff;

      const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);
      const result = txInput.toIsoBuf();
      expect(result.toString("hex")).toEqual(
        "00000000000000000000000000000000000000000000000000000000000000000000000001a7ffffffff",
      );
    });
  });

  test("toIsoBuf with pushdata", () => {
    const inputTxHash = Buffer.alloc(32);
    const inputTxIndex = 0;
    const script = Script.fromIsoStr("0x121212").unwrap();
    const lockRel = 0xffffffff;

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);
    const result = txInput.toIsoBuf();
    expect(result.toString("hex")).toEqual(
      "000000000000000000000000000000000000000000000000000000000000000000000000054c03121212ffffffff",
    );
  });

  test("isNull", () => {
    const inputTxHash = Buffer.alloc(32);
    const inputTxIndex = 0;
    const script = Script.fromIsoStr("0x121212").unwrap();
    const lockRel = 0;

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput.isNull()).toBe(false);

    const nullTxInput = new TxInput(
      Buffer.alloc(32),
      0xffffffff,
      new Script(),
      0xffffffff,
    );
    expect(nullTxInput.isNull()).toBe(true);
  });

  test("isFinal", () => {
    const inputTxHash = Buffer.alloc(32);
    const inputTxIndex = 0;
    const script = Script.fromIsoStr("0x121212").unwrap();
    const lockRel = 0;

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput.isFinal()).toBe(false);

    const finalTxInput = new TxInput(
      Buffer.alloc(32),
      0xffffffff,
      new Script(),
      0xffffffff,
    );
    expect(finalTxInput.isFinal()).toBe(true);
  });

  test("isCoinbase", () => {
    const inputTxHash = Buffer.alloc(32);
    const inputTxIndex = 0;
    const script = Script.fromIsoStr("0x121212").unwrap();
    const lockRel = 0;

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput.isCoinbase()).toBe(false);

    const coinbaseTxInput = new TxInput(
      Buffer.alloc(32),
      0xffffffff,
      new Script(),
      0xffffffff,
    );
    expect(coinbaseTxInput.isCoinbase()).toBe(true);
  });

  test("fromCoinbase", () => {
    const script = Script.fromIsoStr("0x121212").unwrap();
    const txInput = TxInput.fromCoinbase(script);
    expect(txInput).toBeInstanceOf(TxInput);
    expect(txInput.isNull()).toBe(true);
    expect(txInput.isFinal()).toBe(true);
    expect(txInput.script.toIsoStr()).toEqual(script.toIsoStr());
  });
});
