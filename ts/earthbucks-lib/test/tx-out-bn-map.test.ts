import { describe, expect, test, beforeEach, it } from "vitest";
import { TxOutBnMap } from "../src/tx-out-bn-map";
import { TxOut } from "../src/tx-out";
import { Script } from "../src/script";
import { EbxBuffer } from "../src/ebx-buffer";
import { TxOutBn } from "../src/tx-out-bn";

describe("TxOutBnMap", () => {
  let txOutBnMap: TxOutBnMap;
  let txOut: TxOut;
  let txOutBn: TxOutBn;
  let txIdHash: EbxBuffer;
  let outputIndex: number;

  beforeEach(() => {
    txOutBnMap = new TxOutBnMap();
    txOut = new TxOut(BigInt(100), Script.fromEmpty());
    txOutBn = new TxOutBn(txOut, 0n);
    txIdHash = EbxBuffer.from([1, 2, 3, 4]);
    outputIndex = 0;
  });

  test("nameFromOutput", () => {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    expect(name).toBe("01020304:0");
  });

  test("add", () => {
    txOutBnMap.add(txOutBn, txIdHash, outputIndex);
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    expect(txOutBnMap.map.get(name)).toBe(txOutBn);
  });

  test("remove", () => {
    txOutBnMap.add(txOutBn, txIdHash, outputIndex);
    txOutBnMap.remove(txIdHash, outputIndex);
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
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
    const txOutBn1 = new TxOutBn(txOut1, 0n);
    const txOut2 = txOut;
    const txOutBn2 = new TxOutBn(txOut2, 1n);
    txOutputMap.add(txOutBn1, txIdHash, 0);
    txOutputMap.add(txOutBn2, txIdHash, 1);

    const values = Array.from(txOutputMap.values());

    expect(values.length).toBe(2);
    expect(values).toContain(txOutBn1);
    expect(values).toContain(txOutBn2);
  });
});
