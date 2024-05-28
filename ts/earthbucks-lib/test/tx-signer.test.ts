import { describe, expect, test, beforeEach, it } from "vitest";
import { TxBuilder } from "../src/tx-builder.ts";
import { TxOutBnMap } from "../src/tx-out-bn-map.ts";
import { TxOut } from "../src/tx-out.ts";
import { Script } from "../src/script.ts";
import { KeyPair } from "../src/key-pair.ts";
import { Pkh } from "../src/pkh.ts";
import { PkhKeyMap } from "../src/pkh-key-map.ts";
import { TxSigner } from "../src/tx-signer.ts";
import { ScriptInterpreter } from "../src/script-interpreter.ts";
import { HashCache } from "../src/tx.ts";
import { Buffer } from "buffer";
import { TxOutBn } from "../src/tx-out-bn.ts";

describe("TxSigner", () => {
  let txBuilder: TxBuilder;
  let txSigner: TxSigner;
  let txOutBnMap: TxOutBnMap;
  let pkhKeyMap: PkhKeyMap;

  beforeEach(() => {
    txOutBnMap = new TxOutBnMap();
    pkhKeyMap = new PkhKeyMap();
    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for (let i = 0; i < 5; i++) {
      const key = KeyPair.fromRandom();
      const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
      pkhKeyMap.add(key, pkh.buf);
      const script = Script.fromPkhOutput(pkh.buf);
      const txOut = new TxOut(BigInt(100), script);
      const txOutBn = new TxOutBn(txOut, 0n);
      txOutBnMap.add(txOutBn, Buffer.from("00".repeat(32), "hex"), i);
    }

    const changeScript = Script.fromEmpty();
    txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
  });

  test("should sign a tx", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
    const script = Script.fromPkhOutput(pkh.buf);
    const output = new TxOut(BigInt(50), script);
    txBuilder.addOutput(output);

    const tx = txBuilder.build().unwrap();

    expect(tx.inputs.length).toBe(1);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0].value).toBe(BigInt(50));

    txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, 0n);
    const signed = txSigner.sign(0);
    expect(signed.ok).toBe(true);

    const txInput = tx.inputs[0];
    const txOutBn = txOutBnMap.get(txInput.inputTxId, txInput.inputTxNOut);
    const execScript = txOutBn?.txOut.script as Script;
    const sigBuf = txInput.script.chunks[0].buf as Buffer;
    expect(sigBuf?.length).toBe(65);
    const pubKeyBuf = txInput.script.chunks[1].buf as Buffer;
    expect(pubKeyBuf?.length).toBe(33);

    const stack = [sigBuf, pubKeyBuf];
    const hashCache = new HashCache();

    const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
      execScript,
      tx,
      0,
      stack,
      100n,
      hashCache,
    );

    const result = scriptInterpreter.evalScript();
    expect(result).toBe(true);
  });

  test("should sign two inputs", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
    const script = Script.fromPkhOutput(pkh.buf);
    const output = new TxOut(BigInt(100), script);
    txBuilder.addOutput(output);
    txBuilder.addOutput(output);

    const tx = txBuilder.build().unwrap();

    expect(tx.inputs.length).toBe(2);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0].value).toBe(BigInt(100));
    expect(tx.outputs[1].value).toBe(BigInt(100));

    txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, 0n);
    const signed1 = txSigner.sign(0);
    expect(signed1.ok).toBe(true);
    const signed2 = txSigner.sign(1);
    expect(signed2.ok).toBe(true);

    const txInput1 = tx.inputs[0];
    const txOutput1 = txOutBnMap.get(txInput1.inputTxId, txInput1.inputTxNOut);
    const execScript1 = txOutput1?.txOut.script as Script;
    const sigBuf1 = txInput1.script.chunks[0].buf as Buffer;
    expect(sigBuf1?.length).toBe(65);
    const pubKeyBuf1 = txInput1.script.chunks[1].buf as Buffer;
    expect(pubKeyBuf1?.length).toBe(33);

    const stack1 = [sigBuf1, pubKeyBuf1];
    const hashCache1 = new HashCache();

    const scriptInterpreter1 = ScriptInterpreter.fromOutputScriptTx(
      execScript1,
      tx,
      0,
      stack1,
      100n,
      hashCache1,
    );

    const result1 = scriptInterpreter1.evalScript();
    expect(result1).toBe(true);

    const txInput2 = tx.inputs[1];
    const txOutput2 = txOutBnMap.get(txInput2.inputTxId, txInput2.inputTxNOut);
    const execScript2 = txOutput2?.txOut.script as Script;
    const sigBuf2 = txInput2.script.chunks[0].buf as Buffer;
    expect(sigBuf2?.length).toBe(65);
    const pubKeyBuf2 = txInput2.script.chunks[1].buf as Buffer;
    expect(pubKeyBuf2?.length).toBe(33);

    const stack2 = [sigBuf2, pubKeyBuf2];
    const hashCache2 = new HashCache();

    const scriptInterpreter2 = ScriptInterpreter.fromOutputScriptTx(
      execScript2,
      tx,
      1,
      stack2,
      100n,
      hashCache2,
    );

    const result2 = scriptInterpreter2.evalScript();
    expect(result2).toBe(true);
  });
});
