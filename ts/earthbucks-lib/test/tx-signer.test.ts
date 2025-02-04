import { describe, expect, test, beforeEach, it } from "vitest";
import { TxBuilder } from "../src/tx-builder.js";
import { TxOutBnMap } from "../src/tx-out-bn-map.js";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { KeyPair } from "../src/key-pair.js";
import { Pkh } from "../src/pkh.js";
import { PkhKeyMap } from "../src/pkh-key-map.js";
import { TxSigner } from "../src/tx-signer.js";
import { ScriptInterpreter } from "../src/script-interpreter.js";
import { HashCache } from "../src/tx.js";
import { FixedBuf } from "@webbuf/fixedbuf";
import type { WebBuf } from "@webbuf/webbuf";
import { TxOutBn } from "../src/tx-out-bn.js";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";
import type { TxIn } from "../src/tx-in.js";

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
      const pkh = Pkh.fromPubKeyBuf(key.pubKey.toBuf());
      pkhKeyMap.add(key, pkh);
      const script = Script.fromPkhOutput(pkh);
      const txOut = new TxOut(new U64BE(100), script);
      const txOutBn = new TxOutBn(txOut, new U32BE(0n));
      txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32BE(i));
    }

    const changeScript = Script.fromEmpty();
    txBuilder = new TxBuilder(txOutBnMap, changeScript, new U32BE(0n));
  });

  test("should sign a tx", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(key.pubKey.toBuf());
    const script = Script.fromPkhOutput(pkh);
    const output = new TxOut(new U64BE(50), script);
    txBuilder.addOutput(output);

    const tx = txBuilder.build();

    expect(tx.inputs.length).toBe(1);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0]?.value.bn).toEqual(BigInt(50));

    txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U32BE(0n));
    const signed = txSigner.sign(new U32BE(0));

    const txInput = tx.inputs[0] as TxIn;
    const txOutBn = txOutBnMap.get(txInput.inputTxId, txInput.inputTxNOut);
    const execScript = txOutBn?.txOut.script as Script;
    const sigBuf = txInput.script.chunks[0]?.buf as WebBuf;
    expect(sigBuf?.length).toBe(65);
    const pubKeyBuf = txInput.script.chunks[1]?.buf as WebBuf;
    expect(pubKeyBuf?.length).toBe(33);

    const stack = [sigBuf, pubKeyBuf];
    const hashCache = new HashCache();

    const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
      execScript,
      tx,
      new U32BE(0),
      stack,
      new U64BE(100n),
      hashCache,
    );

    const result = scriptInterpreter.evalScript();
    expect(!!result.value).toBe(true);
  });

  test("should sign two inputs", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(key.pubKey.toBuf());
    const script = Script.fromPkhOutput(pkh);
    const output = new TxOut(new U64BE(100), script);
    txBuilder.addOutput(output);
    txBuilder.addOutput(output);

    const tx = txBuilder.build();

    expect(tx.inputs.length).toBe(2);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0]?.value.bn).toEqual(BigInt(100));
    expect(tx.outputs[1]?.value.bn).toEqual(BigInt(100));

    txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U32BE(0n));
    const signed1 = txSigner.sign(new U32BE(0));
    expect(signed1).toBeTruthy();
    const signed2 = txSigner.sign(new U32BE(1));
    expect(signed2).toBeTruthy();

    const txInput1 = tx.inputs[0] as TxIn;
    const txOutput1 = txOutBnMap.get(txInput1.inputTxId, txInput1.inputTxNOut);
    const execScript1 = txOutput1?.txOut.script as Script;
    const sigBuf1 = txInput1.script.chunks[0]?.buf as WebBuf;
    expect(sigBuf1?.length).toBe(65);
    const pubKeyBuf1 = txInput1.script.chunks[1]?.buf as WebBuf;
    expect(pubKeyBuf1?.length).toBe(33);

    const stack1 = [sigBuf1, pubKeyBuf1];
    const hashCache1 = new HashCache();

    const scriptInterpreter1 = ScriptInterpreter.fromOutputScriptTx(
      execScript1,
      tx,
      new U32BE(0),
      stack1,
      new U64BE(100n),
      hashCache1,
    );

    const result1 = scriptInterpreter1.evalScript();
    expect(!!result1.value).toBe(true);

    const txInput2 = tx.inputs[1] as TxIn;
    const txOutput2 = txOutBnMap.get(txInput2.inputTxId, txInput2.inputTxNOut);
    const execScript2 = txOutput2?.txOut.script as Script;
    const sigBuf2 = txInput2.script.chunks[0]?.buf as WebBuf;
    expect(sigBuf2?.length).toBe(65);
    const pubKeyBuf2 = txInput2.script.chunks[1]?.buf as WebBuf;
    expect(pubKeyBuf2?.length).toBe(33);

    const stack2 = [sigBuf2, pubKeyBuf2];
    const hashCache2 = new HashCache();

    const scriptInterpreter2 = ScriptInterpreter.fromOutputScriptTx(
      execScript2,
      tx,
      new U32BE(1),
      stack2,
      new U64BE(100n),
      hashCache2,
    );

    const result2 = scriptInterpreter2.evalScript();
    expect(!!result2.value).toBe(true);
  });
});
