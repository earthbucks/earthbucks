import { describe, expect, test, beforeEach, it } from "vitest";
import { TxBuilder } from "../src/tx-builder.js";
import { TxOutBnMap } from "../src/tx-out-bn-map.js";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { KeyPair } from "../src/key-pair.js";
import { Pkh } from "../src/pkh.js";
import { PkhKeyMap } from "../src/pkh-key-map.js";
import { IsoBuf, FixedIsoBuf } from "../src/iso-buf.js";
import { TxOutBn } from "../src/tx-out-bn.js";

describe("TxBuilder", () => {
  let txBuilder: TxBuilder;
  let txOutBnMap: TxOutBnMap;
  let pkhKeyMap: PkhKeyMap;

  beforeEach(() => {
    txOutBnMap = new TxOutBnMap();
    pkhKeyMap = new PkhKeyMap();
    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for (let i = 0; i < 5; i++) {
      const key = KeyPair.fromRandom();
      const pkh = Pkh.fromPubKeyBuf(key.pubKey.toIsoBuf());
      pkhKeyMap.add(key, pkh.buf);
      const script = Script.fromPkhOutput(pkh.buf);
      const txOut = new TxOut(BigInt(100), script);
      const txOutBn = new TxOutBn(txOut, 0n);
      txOutBnMap.add(txOutBn, FixedIsoBuf.alloc(32), i);
    }

    const changeScript = Script.fromEmpty();
    txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
  });

  test("should build a valid tx when input is enough to cover the output", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(key.pubKey.toIsoBuf());
    const script = Script.fromPkhOutput(pkh.buf);
    const output = new TxOut(BigInt(50), script);
    txBuilder.addOutput(output);

    const tx = txBuilder.build().unwrap();

    expect(tx.inputs.length).toBe(1);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0].value).toBe(BigInt(50));
  });

  test("should build an invalid tx when input is insufficient to cover the output", () => {
    const txOut = new TxOut(BigInt(10000), Script.fromEmpty());
    txBuilder.addOutput(txOut);

    const tx = txBuilder.build().unwrap();

    expect(tx.inputs.length).toBe(5);
    expect(tx.outputs.length).toBe(1);
    expect(txBuilder.inputAmount).toBe(BigInt(500));
    expect(tx.outputs[0].value).toBe(BigInt(10000));
  });
});
