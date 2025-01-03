import { describe, expect, test, beforeEach, it } from "vitest";
import { TxOutBnMap } from "../src/tx-out-bn-map.js";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { FixedBuf } from "@webbuf/fixedbuf";
import { TxOutBn } from "../src/tx-out-bn.js";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

describe("TxOutBnMap", () => {
  describe("method tests", () => {
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

  describe("TxOutBnMap serialization", () => {
    let txOutBnMap: TxOutBnMap;
    let txOut1: TxOut;
    let txOut2: TxOut;
    let txOutBn1: TxOutBn;
    let txOutBn2: TxOutBn;
    let txIdHash1: FixedBuf<32>;
    let txIdHash2: FixedBuf<32>;

    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();

      // Create test data
      txOut1 = new TxOut(new U64BE(100n), Script.fromEmpty());
      txOut2 = new TxOut(new U64BE(200n), Script.fromEmpty());
      txOutBn1 = new TxOutBn(txOut1, new U32BE(1n));
      txOutBn2 = new TxOutBn(txOut2, new U32BE(2n));

      txIdHash1 = FixedBuf.fromHex(
        32,
        "0102030400000000000000000000000000000000000000000000000000000000",
      );
      txIdHash2 = FixedBuf.fromHex(
        32,
        "0506070800000000000000000000000000000000000000000000000000000000",
      );
    });

    test("should correctly serialize and deserialize an empty map", () => {
      const buf = txOutBnMap.toBuf();
      const deserializedMap = TxOutBnMap.fromBuf(buf);

      expect(deserializedMap.map.size).toBe(0);
    });

    test("should correctly serialize and deserialize a map with one entry", () => {
      txOutBnMap.add(txOutBn1, txIdHash1, new U32BE(0));

      const buf = txOutBnMap.toBuf();
      const deserializedMap = TxOutBnMap.fromBuf(buf);

      expect(deserializedMap.map.size).toBe(1);

      const retrievedTxOutBn = deserializedMap.get(txIdHash1, new U32BE(0));
      expect(retrievedTxOutBn?.blockNum.n).toBe(txOutBn1.blockNum.n);
      expect(retrievedTxOutBn?.txOut.value.n).toBe(txOutBn1.txOut.value.n);
    });

    test("should correctly serialize and deserialize multiple entries", () => {
      txOutBnMap.add(txOutBn1, txIdHash1, new U32BE(0));
      txOutBnMap.add(txOutBn2, txIdHash2, new U32BE(1));

      const buf = txOutBnMap.toBuf();
      const deserializedMap = TxOutBnMap.fromBuf(buf);

      expect(deserializedMap.map.size).toBe(2);

      const retrieved1 = deserializedMap.get(txIdHash1, new U32BE(0));
      const retrieved2 = deserializedMap.get(txIdHash2, new U32BE(1));

      expect(retrieved1?.blockNum.n).toBe(txOutBn1.blockNum.n);
      expect(retrieved1?.txOut.value.n).toBe(txOutBn1.txOut.value.n);
      expect(retrieved2?.blockNum.n).toBe(txOutBn2.blockNum.n);
      expect(retrieved2?.txOut.value.n).toBe(txOutBn2.txOut.value.n);
    });
  });
});
