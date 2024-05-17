import { describe, expect, test, beforeEach, it } from "@jest/globals";
import TxBuilder from "../src/tx-builder";
import TxOutBnMap from "../src/tx-out-bn-map";
import TxOut from "../src/tx-out";
import Script from "../src/script";
import KeyPair from "../src/key-pair";
import Pkh from "../src/pkh";
import PkhKeyMap from "../src/pkh-key-map";
import TxSigner from "../src/tx-signer";
import TxVerifier from "../src/tx-verifier";
import { Buffer } from "buffer";
import TxOutBn from "../src/tx-out-bn";

describe("TxVerifier", () => {
  let txBuilder: TxBuilder;
  let txSigner: TxSigner;
  let txOutMap: TxOutBnMap;
  let pkhKeyMap: PkhKeyMap;

  beforeEach(() => {
    txOutMap = new TxOutBnMap();
    pkhKeyMap = new PkhKeyMap();
    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for (let i = 0; i < 5; i++) {
      const key = KeyPair.fromRandom();
      const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
      pkhKeyMap.add(key, pkh.buf);
      const script = Script.fromPkhOutput(pkh.buf);
      const txOut = new TxOut(BigInt(100), script);
      const txOutBn = new TxOutBn(txOut, 0n);
      txOutMap.add(txOutBn, Buffer.from("00".repeat(32), "hex"), i);
    }

    const changeScript = Script.fromIsoStr("").unwrap();
    txBuilder = new TxBuilder(txOutMap, changeScript, 0n, 0n);
  });

  test("should sign and verify a tx", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
    const script = Script.fromPkhOutput(pkh.buf);
    const txOut = new TxOut(BigInt(50), Script.fromIsoStr("").unwrap());
    txBuilder.addOutput(txOut);

    const tx = txBuilder.build().unwrap();

    expect(tx.inputs.length).toBe(1);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0].value).toBe(BigInt(50));

    txSigner = new TxSigner(tx, txOutMap, pkhKeyMap, 0n);
    const signed = txSigner.sign(0);
    expect(signed.ok).toBe(true);

    const txVerifier = new TxVerifier(tx, txOutMap);
    const verifiedInput = txVerifier.verifyInputScript(0);
    expect(verifiedInput).toBe(true);

    const verifiedScripts = txVerifier.verifyScripts();
    expect(verifiedScripts).toBe(true);

    const verifiedOutputValues = txVerifier.verifyOutputValues();
    expect(verifiedOutputValues).toBe(true);

    const verified = txVerifier.verify();
    expect(verified).toBe(true);
  });

  test("should sign and verify a tx with two inputs", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
    const script = Script.fromPkhOutput(pkh.buf);
    const txOut = new TxOut(BigInt(100), Script.fromIsoStr("").unwrap());
    txBuilder.addOutput(txOut);
    txBuilder.addOutput(txOut);

    const tx = txBuilder.build().unwrap();

    expect(tx.inputs.length).toBe(2);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0].value).toBe(BigInt(100));
    expect(tx.outputs[1].value).toBe(BigInt(100));

    txSigner = new TxSigner(tx, txOutMap, pkhKeyMap, 0n);
    const signed1 = txSigner.sign(0);
    expect(signed1.ok).toBe(true);
    const signed2 = txSigner.sign(1);
    expect(signed2.ok).toBe(true);

    const txVerifier = new TxVerifier(tx, txOutMap);
    const verifiedInput1 = txVerifier.verifyInputScript(0);
    expect(verifiedInput1).toBe(true);
    const verifiedInput2 = txVerifier.verifyInputScript(1);
    expect(verifiedInput2).toBe(true);

    const verifiedScripts = txVerifier.verifyScripts();
    expect(verifiedScripts).toBe(true);

    const verifiedOutputValues = txVerifier.verifyOutputValues();
    expect(verifiedOutputValues).toBe(true);

    const verified = txVerifier.verify();
    expect(verified).toBe(true);
  });
});
