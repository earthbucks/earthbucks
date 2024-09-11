import { describe, expect, test, beforeEach, it } from "vitest";
import { TxIn } from "../src/tx-in.js";
import { Script } from "../src/script.js";
import { BufReader } from "../src/buf-reader.js";
import { SysBuf, FixedBuf } from "../src/buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";
import { ScriptChunk } from "../src/script-chunk.js";

describe("TxInput", () => {
  test("should create a TxInput", () => {
    const inputTxHash = FixedBuf.alloc(32);
    const inputTxIndex = new U32(0);
    const script = new Script();
    const lockRel = new U32(0);

    const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput).toBeInstanceOf(TxIn);
    expect(txInput.inputTxId).toBe(inputTxHash);
    expect(txInput.inputTxNOut).toBe(inputTxIndex);
    expect(txInput.script).toBe(script);
    expect(txInput.lockRel).toBe(lockRel);
  });

  describe("fromBufReader", () => {
    test("fromBufReader", () => {
      const inputTxHash = FixedBuf.alloc(32);
      const inputTxIndex = new U32(0);
      const script = new Script();
      const lockRel = new U32(0);

      const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);

      const reader = new BufReader(txInput.toBuf());
      const result = TxIn.fromBufReader(reader);
      expect(result).toBeInstanceOf(TxIn);
      expect(SysBuf.from(result.inputTxId.buf).toString("hex")).toEqual(
        SysBuf.from(inputTxHash.buf).toString("hex"),
      );
      expect(result.inputTxNOut).toEqual(inputTxIndex);
      expect(result.script.toString()).toEqual(script.toString());
      expect(result.lockRel).toEqual(lockRel);
    });
  });

  describe("toBuf", () => {
    test("toBuf", () => {
      const inputTxHash = FixedBuf.alloc(32);
      const inputTxIndex = new U32(0);
      const script = new Script();
      const lockRel = new U32(0);

      const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);
      const result = txInput.toBuf();
      expect(result.toString("hex")).toEqual(
        "0000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      );
    });

    test("toBuf with script", () => {
      const inputTxHash = FixedBuf.alloc(32);
      const inputTxIndex = new U32(0);
      const script = Script.fromString("DOUBLEBLAKE3");
      const lockRel = new U32(0);

      const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);
      const result = txInput.toBuf();
      expect(result.toString("hex")).toEqual(
        "00000000000000000000000000000000000000000000000000000000000000000000000001a700000000",
      );
    });
  });

  test("toBuf with pushdata", () => {
    const inputTxHash = FixedBuf.alloc(32);
    const inputTxIndex = new U32(0);
    const script = Script.fromString("0x121212");
    const lockRel = new U32(0xffffffff);

    const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);
    const result = txInput.toBuf();
    expect(result.toString("hex")).toEqual(
      "000000000000000000000000000000000000000000000000000000000000000000000000054c03121212ffffffff",
    );
  });

  test("isNull", () => {
    const inputTxHash = FixedBuf.alloc(32);
    const inputTxIndex = new U32(0);
    const script = Script.fromString("0x121212");
    const lockRel = new U32(0);

    const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput.isNull()).toBe(false);

    const nullTxInput = new TxIn(
      FixedBuf.alloc(32),
      new U32(0xffffffff),
      new Script(),
      new U32(0),
    );
    expect(nullTxInput.isNull()).toBe(true);
  });

  test("isMinimalLock", () => {
    const inputTxHash = FixedBuf.alloc(32);
    const inputTxIndex = new U32(0);
    const script = Script.fromString("0x121212");
    const lockRel = new U32(0xffffffff);

    const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput.isMinimalLock()).toBe(false);

    const finalTxInput = new TxIn(
      FixedBuf.alloc(32),
      new U32(0xffffffff),
      new Script(),
      new U32(0),
    );
    expect(finalTxInput.isMinimalLock()).toBe(true);
  });

  test("isMintTx", () => {
    const inputTxHash = FixedBuf.alloc(32);
    const inputTxIndex = new U32(0);
    const script = new Script([
      ScriptChunk.fromData(SysBuf.alloc(32)),
      ScriptChunk.fromData(SysBuf.alloc(32)),
      ScriptChunk.fromData(SysBuf.from("example.com", "utf8")),
    ]);
    const lockRel = new U32(0);

    const txInput = new TxIn(inputTxHash, inputTxIndex, script, lockRel);
    expect(txInput.isMintTx()).toBe(false);

    const mintTxInput = new TxIn(
      FixedBuf.alloc(32),
      new U32(0xffffffff),
      new Script([
        ScriptChunk.fromData(SysBuf.alloc(32)),
        ScriptChunk.fromData(SysBuf.alloc(32)),
        ScriptChunk.fromData(SysBuf.from("example.com", "utf8")),
      ]),
      new U32(0),
    );
    expect(mintTxInput.isMintTx()).toBe(true);
  });

  test("fromMintTx", () => {
    const script = Script.fromString("0x121212");
    const txInput = TxIn.fromMintTxScript(script);
    expect(txInput).toBeInstanceOf(TxIn);
    expect(txInput.isNull()).toBe(true);
    expect(txInput.isMinimalLock()).toBe(true);
    expect(txInput.script.toString()).toEqual(script.toString());
  });
});
