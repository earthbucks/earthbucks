import { describe, expect, test, beforeEach, it } from "@jest/globals";
import ScriptInterpreter from "../src/script-interpreter";
import Script from "../src/script";
import Tx, { HashCache } from "../src/tx";
import TxInput from "../src/tx-input";
import TxOutput from "../src/tx-output";
import fs from "fs";
import path from "path";
import KeyPair from "../src/key-pair";
import Pkh from "../src/pkh";
import TxSignature from "../src/tx-signature";
import PubKey from "../src/pub-key";
import PrivKey from "../src/priv-key";
import { Buffer } from "buffer";

describe("ScriptInterpreter", () => {
  let tx: Tx;

  beforeEach(() => {
    tx = new Tx(
      1,
      [new TxInput(Buffer.alloc(0), 0, new Script(), 0xffffffff)],
      [new TxOutput(BigInt(0), new Script())],
      BigInt(0),
    );
  });

  describe("sanity tests", () => {
    test("0", () => {
      const script = new Script().fromString("0");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        0,
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(false);
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("00");
    });

    test("pushdata1", () => {
      const script = new Script().fromString("0xff");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        0,
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff");
    });

    test("PUSHDATA1", () => {
      const script = new Script().fromString("0xffff");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        0,
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ffff");
    });

    test("PUSHDATA2", () => {
      const script = new Script().fromString("0x" + "ff".repeat(256));
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        0,
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff".repeat(256));
    });

    test("PUSHDATA4", () => {
      const script = new Script().fromString("0x" + "ff".repeat(65536));
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        0,
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff".repeat(65536));
    });

    test("1NEGATE", () => {
      const script = new Script().fromString("1NEGATE");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        0,
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff");
    });

    test("CHECKSIG", () => {
      const outputPrivKeyHex =
        "d9486fac4a1de03ca8c562291182e58f2f3e42a82eaf3152ccf744b3a8b3b725";
      const outputPrivKeyBuf = Buffer.from(outputPrivKeyHex, "hex");
      const outputKey = KeyPair.fromPrivKeyBuffer(outputPrivKeyBuf);
      const outputPubKey = outputKey.pubKey.toBuffer();
      expect(Buffer.from(outputPubKey).toString("hex")).toEqual(
        "0377b8ba0a276329096d51275a8ab13809b4cd7af856c084d60784ed8e4133d987",
      );
      const outputAddress = Pkh.fromPubKeyBuffer(Buffer.from(outputPubKey));
      const outputScript = Script.fromAddressOutput(outputAddress.buf);
      const outputAmount = BigInt(100);
      const outputTxId = Buffer.from("00".repeat(32), "hex");
      const outputTxIndex = 0;

      const tx = new Tx(
        1,
        [new TxInput(outputTxId, outputTxIndex, new Script(), 0xffffffff)],
        [new TxOutput(outputAmount, outputScript)],
        BigInt(0),
      );

      const sig = tx.signNoCache(
        0,
        outputPrivKeyBuf,
        outputScript.toBuffer(),
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );

      const stack = [sig.toBuffer(), outputPubKey];
      const hashCache = new HashCache();

      const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
        outputScript,
        tx,
        0,
        stack,
        outputAmount,
        hashCache,
      );

      const result = scriptInterpreter.evalScript();
      expect(result).toBe(true);
    });

    test("CHECKMULTISIG", () => {
      // Define private keys
      const privKeysHex = [
        "eee66a051d43a62b00da7185bbf2a13b42f601a0b987a8f1815b4213c9343451",
        "f8749a7b6a825eb9e82e27720fd3b90e0f157adc75fe3e0efbf3c8a335eb3ef5",
        "5df05870846dd200a7d29da98ad32016209d99af0422d66e568f97720d1acee3",
        "c91b042751b94d705abee4fc67eb483dc32ae432e037f66120f5e865e4257c66",
        "b78467b0ea6afa6c42c94333dcece978829bdb7ba7b97a2273b72cdc6be8c553",
      ];

      // Convert private keys to Uint8Array format
      const privKeysU8Vec = privKeysHex.map((hex) => Buffer.from(hex, "hex"));

      // Generate public keys
      const pubKeys = privKeysU8Vec.map((privKey) =>
        PrivKey.fromBuffer(privKey).toPubKeyBuffer(),
      );

      // Create a multisig output script
      const outputScript = Script.fromMultiSigOutput(3, pubKeys);

      // Other tx parameters
      const outputAmount = BigInt(100);
      const outputTxId = Buffer.from("00".repeat(32), "hex");
      const outputTxIndex = 0;

      // Create a tx
      const tx = new Tx(
        1,
        [new TxInput(outputTxId, outputTxIndex, new Script(), 0xffffffff)],
        [new TxOutput(outputAmount, outputScript)],
        BigInt(0),
      );

      // Sign the tx with the first 3 private keys
      const sigs = privKeysU8Vec
        .slice(0, 3)
        .map((privKey) =>
          tx
            .signNoCache(
              0,
              privKey,
              outputScript.toBuffer(),
              outputAmount,
              TxSignature.SIGHASH_ALL,
            )
            .toBuffer(),
        );

      // Create a stack with the signatures
      const stack = [...sigs];
      const hashCache = new HashCache();

      // Create a script interpreter
      const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
        outputScript,
        tx,
        0,
        stack,
        outputAmount,
        hashCache,
      );

      // Evaluate the script
      const result = scriptInterpreter.evalScript();
      expect(scriptInterpreter.errStr).toBe("");
      expect(result).toBe(true);
    });
  });

  describe("test vectors", () => {
    interface TestScript {
      name: string;
      script: string;
      expected_return_value: string;
      expected_success: boolean;
      expected_error: string;
    }

    describe("script interpreter scripts", () => {
      const filePath = path.resolve(
        __dirname,
        "../../../json/script_interpreter.json",
      );
      const jsonString = fs.readFileSync(filePath, "utf-8");
      const testScripts: TestScript[] = JSON.parse(jsonString).scripts;
      let tx: Tx;

      beforeEach(() => {
        tx = new Tx(
          1,
          [new TxInput(Buffer.alloc(0), 0, new Script(), 0xffffffff)],
          [new TxOutput(BigInt(0), new Script())],
          BigInt(0),
        );
      });

      testScripts.forEach((testScript) => {
        test(testScript.name, () => {
          const script = Script.fromString(testScript.script);
          const hashCache = new HashCache();
          const scriptInterpreter = ScriptInterpreter.fromScriptTx(
            script,
            tx,
            0,
            hashCache,
          );
          scriptInterpreter.evalScript();

          expect(scriptInterpreter.errStr).toEqual(testScript.expected_error);
          expect(
            scriptInterpreter.returnValue &&
              Buffer.from(scriptInterpreter.returnValue).toString("hex"),
          ).toBe(testScript.expected_return_value);
          expect(scriptInterpreter.returnSuccess).toBe(
            testScript.expected_success,
          );
        });
      });
    });
  });
});
