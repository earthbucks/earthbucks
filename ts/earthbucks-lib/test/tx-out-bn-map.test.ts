import { describe, expect, test, beforeEach, it } from "vitest";
import { TxOutBnMap } from "../src/tx-out-bn-map.js";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { FixedBuf } from "@webbuf/fixedbuf";
import { TxOutBn } from "../src/tx-out-bn.js";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

describe("TxOutBnMap", () => {
  let txOutBnMap: TxOutBnMap;
  let txOut: TxOut;
  let txOutBn: TxOutBn;
  let txIdHash: FixedBuf<32>;
  let outputIndex: U32BE;

  beforeEach(() => {
    txOutBnMap = new TxOutBnMap();
    txOut = new TxOut(new U64BE(100), Script.fromEmpty());
    txOutBn = new TxOutBn(txOut, new U32BE(0n));
    txIdHash = FixedBuf.fromHex(
      32,
      "0102030400000000000000000000000000000000000000000000000000000000",
    );
    outputIndex = new U32BE(0);
  });

  test("nameFromOutput", () => {
    const name = TxOutBnMap.nameFromOutput(txIdHash.buf, outputIndex);
    expect(name).toBe(
      "0102030400000000000000000000000000000000000000000000000000000000:00000000",
    );
  });

  test("add", () => {
    txOutBnMap.add(txOutBn, txIdHash, outputIndex);
    const name = TxOutBnMap.nameFromOutput(txIdHash.buf, outputIndex);
    expect(txOutBnMap.map.get(name)).toBe(txOutBn);
  });

  test("remove", () => {
    txOutBnMap.add(txOutBn, txIdHash, outputIndex);
    txOutBnMap.remove(txIdHash, outputIndex);
    const name = TxOutBnMap.nameFromOutput(txIdHash.buf, outputIndex);
    expect(txOutBnMap.map.get(name)).toBeUndefined();
  });

  test("get", () => {
    txOutBnMap.add(txOutBn, txIdHash, outputIndex);
    const retrievedOutput = txOutBnMap.get(txIdHash, outputIndex);
    expect(retrievedOutput).toBe(txOutBn);
  });

  test("values method should return all TxOutput values", () => {
    const txOutputMap = new TxOutBnMap();
    const txOut1 = txOut;
    const txOutBn1 = new TxOutBn(txOut1, new U32BE(0n));
    const txOut2 = txOut;
    const txOutBn2 = new TxOutBn(txOut2, new U32BE(1n));
    txOutputMap.add(txOutBn1, txIdHash, new U32BE(0));
    txOutputMap.add(txOutBn2, txIdHash, new U32BE(1));

    const values = Array.from(txOutputMap.values());

    expect(values.length).toBe(2);
    expect(values).toContain(txOutBn1);
    expect(values).toContain(txOutBn2);
  });
});
