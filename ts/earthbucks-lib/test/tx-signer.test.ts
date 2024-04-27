import { describe, expect, test, beforeEach, it } from "@jest/globals";
import TxBuilder from "../src/tx-builder";
import TxOutputMap from "../src/tx-output-map";
import TxOutput from "../src/tx-output";
import Script from "../src/script";
import KeyPair from "../src/key-pair";
import Pkh from "../src/pkh";
import PkhKeyMap from "../src/pkh-key-map";
import TxSigner from "../src/tx-signer";
import ScriptInterpreter from "../src/script-interpreter";
import { HashCache } from "../src/tx";
import { Buffer } from "buffer";

describe("TxSigner", () => {
  let txBuilder: TxBuilder;
  let txSigner: TxSigner;
  let txOutMap: TxOutputMap;
  let pkhKeyMap: PkhKeyMap;

  beforeEach(() => {
    txOutMap = new TxOutputMap();
    pkhKeyMap = new PkhKeyMap();
    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for (let i = 0; i < 5; i++) {
      const key = KeyPair.fromRandom();
      const pkh = new Pkh(Buffer.from(key.publicKey));
      pkhKeyMap.add(key, pkh.pkh);
      const script = Script.fromAddressOutput(pkh.pkh);
      const output = new TxOutput(BigInt(100), script);
      txOutMap.add(output, Buffer.from("00".repeat(32), "hex"), i);
    }

    const changeScript = Script.fromString("");
    txBuilder = new TxBuilder(txOutMap, changeScript);
  });

  test("should sign a tx", () => {
    const key = KeyPair.fromRandom();
    const pkh = new Pkh(Buffer.from(key.publicKey));
    const script = Script.fromAddressOutput(pkh.pkh);
    const output = new TxOutput(BigInt(50), script);
    txBuilder.addOutput(BigInt(50), Script.fromString(""));

    const tx = txBuilder.build();

    expect(tx.inputs.length).toBe(1);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0].value).toBe(BigInt(50));

    txSigner = new TxSigner(tx, txOutMap, pkhKeyMap);
    const signed = txSigner.sign(0);
    expect(signed).toBe(true);

    const txInput = tx.inputs[0];
    const txOutput = txOutMap.get(txInput.inputTxId, txInput.inputTxNOut);
    const execScript = txOutput?.script as Script;
    const sigBuf = txInput.script.chunks[0].buffer as Uint8Array;
    expect(sigBuf?.length).toBe(65);
    const pubKeyBuf = txInput.script.chunks[1].buffer as Uint8Array;
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
    const pkh = new Pkh(Buffer.from(key.publicKey));
    const script = Script.fromAddressOutput(pkh.pkh);
    const output = new TxOutput(BigInt(50), script);
    txBuilder.addOutput(BigInt(100), Script.fromString(""));
    txBuilder.addOutput(BigInt(100), Script.fromString(""));

    const tx = txBuilder.build();

    expect(tx.inputs.length).toBe(2);
    expect(tx.outputs.length).toBe(2);
    expect(tx.outputs[0].value).toBe(BigInt(100));
    expect(tx.outputs[1].value).toBe(BigInt(100));

    txSigner = new TxSigner(tx, txOutMap, pkhKeyMap);
    const signed1 = txSigner.sign(0);
    expect(signed1).toBe(true);
    const signed2 = txSigner.sign(1);
    expect(signed2).toBe(true);

    const txInput1 = tx.inputs[0];
    const txOutput1 = txOutMap.get(txInput1.inputTxId, txInput1.inputTxNOut);
    const execScript1 = txOutput1?.script as Script;
    const sigBuf1 = txInput1.script.chunks[0].buffer as Uint8Array;
    expect(sigBuf1?.length).toBe(65);
    const pubKeyBuf1 = txInput1.script.chunks[1].buffer as Uint8Array;
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
    const txOutput2 = txOutMap.get(txInput2.inputTxId, txInput2.inputTxNOut);
    const execScript2 = txOutput2?.script as Script;
    const sigBuf2 = txInput2.script.chunks[0].buffer as Uint8Array;
    expect(sigBuf2?.length).toBe(65);
    const pubKeyBuf2 = txInput2.script.chunks[1].buffer as Uint8Array;
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
