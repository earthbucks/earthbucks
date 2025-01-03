import { describe, expect, test, beforeEach, it } from "vitest";
import { ScriptInterpreter } from "../src/script-interpreter.js";
import { Script } from "../src/script.js";
import { Tx, HashCache } from "../src/tx.js";
import { TxIn } from "../src/tx-in.js";
import { TxOut } from "../src/tx-out.js";
import fs from "node:fs";
import path from "node:path";
import { KeyPair } from "../src/key-pair.js";
import { Pkh } from "../src/pkh.js";
import { TxSignature } from "../src/tx-signature.js";
import { PrivKey } from "../src/priv-key.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

describe("ScriptInterpreter", () => {
  let tx: Tx;

  beforeEach(() => {
    tx = new Tx(
      new U8(0),
      [
        new TxIn(
          FixedBuf.alloc(32, 0),
          new U32BE(0),
          new Script(),
          new U32BE(0xffffffff),
        ),
      ],
      [new TxOut(new U64BE(0), new Script())],
      new U32BE(0),
    );
  });

  describe("sanity tests", () => {
    test("0", () => {
      const script = Script.fromString("0");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        new U32BE(0),
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(false);
      expect(
        scriptInterpreter.returnValue &&
          WebBuf.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("");
    });

    test("pushdata1", () => {
      const script = Script.fromString("0xff");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        new U32BE(0),
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          WebBuf.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff");
    });

    test("PUSHDATA1", () => {
      const script = Script.fromString("0xffff");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        new U32BE(0),
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          WebBuf.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ffff");
    });

    test("PUSHDATA2", () => {
      const script = Script.fromString(`0x${"ff".repeat(256)}`);
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        new U32BE(0),
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          WebBuf.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff".repeat(256));
    });

    test("PUSHDATA4", () => {
      const script = Script.fromString(`0x${"ff".repeat(65536)}`);
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        new U32BE(0),
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          WebBuf.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff".repeat(65536));
    });

    test("1NEGATE", () => {
      const script = Script.fromString("1NEGATE");
      const hashCache = new HashCache();
      const scriptInterpreter = ScriptInterpreter.fromScriptTx(
        script,
        tx,
        new U32BE(0),
        hashCache,
      );
      scriptInterpreter.evalScript();
      expect(scriptInterpreter.returnSuccess).toBe(true);
      expect(scriptInterpreter.returnValue).toBeDefined();
      expect(
        scriptInterpreter.returnValue &&
          WebBuf.from(scriptInterpreter.returnValue).toString("hex"),
      ).toEqual("ff");
    });

    test("CHECKSIG", () => {
      const outputPrivKeyHex =
        "d9486fac4a1de03ca8c562291182e58f2f3e42a82eaf3152ccf744b3a8b3b725";
      const outputPrivKeyBuf = FixedBuf.fromHex(32, outputPrivKeyHex);
      const outputKey = KeyPair.fromPrivKeyBuf(outputPrivKeyBuf);
      const outputPubKey = outputKey.pubKey.toBuf();
      expect(WebBuf.from(outputPubKey.buf).toString("hex")).toEqual(
        "0377b8ba0a276329096d51275a8ab13809b4cd7af856c084d60784ed8e4133d987",
      );
      const outputAddress = Pkh.fromPubKeyBuf(outputPubKey);
      const outputScript = Script.fromPkhOutput(outputAddress);
      const outputAmount = new U64BE(100);
      const outputTxId = FixedBuf.alloc(32, 0);
      const outputTxIndex = new U32BE(0);

      const tx = new Tx(
        new U8(0),
        [
          new TxIn(
            outputTxId,
            outputTxIndex,
            new Script(),
            new U32BE(0xffffffff),
          ),
        ],
        [new TxOut(outputAmount, outputScript)],
        new U32BE(0),
      );

      const sig = tx.signNoCache(
        new U32BE(0),
        PrivKey.fromBuf(outputPrivKeyBuf),
        outputScript.toBuf(),
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );

      const stack = [sig.toBuf(), outputPubKey.buf];
      const hashCache = new HashCache();

      const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
        outputScript,
        tx,
        new U32BE(0),
        stack,
        outputAmount,
        hashCache,
      );

      const result = scriptInterpreter.evalScript();
      expect(!!result.value).toBe(true);
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

      // Convert private keys to EbxBuf format
      const privKeysU8Vec = privKeysHex.map((hex) =>
        FixedBuf.fromBuf(32, WebBuf.from(hex, "hex")),
      );

      // Generate public keys
      const pubKeys = privKeysU8Vec.map(
        (privKey) => PrivKey.fromBuf(privKey).toPubKeyBuf().buf,
      );

      // Create a multisig output script
      const outputScript = Script.fromMultiSigOutput(3, pubKeys);

      // Other tx parameters
      const outputAmount = new U64BE(100);
      const outputTxId = FixedBuf.alloc(32, 0);
      const outputTxIndex = new U32BE(0);

      // Create a tx
      const tx = new Tx(
        new U8(0),
        [
          new TxIn(
            outputTxId,
            outputTxIndex,
            new Script(),
            new U32BE(0xffffffff),
          ),
        ],
        [new TxOut(outputAmount, outputScript)],
        new U32BE(0),
      );

      // Sign the tx with the first 3 private keys
      const sigs = privKeysU8Vec
        .slice(0, 3)
        .map((privKey) =>
          tx
            .signNoCache(
              new U32BE(0),
              PrivKey.fromBuf(privKey),
              outputScript.toBuf(),
              outputAmount,
              TxSignature.SIGHASH_ALL,
            )
            .toBuf(),
        );

      // Create a stack with the signatures
      const stack = [...sigs];
      const hashCache = new HashCache();

      // Create a script interpreter
      const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
        outputScript,
        tx,
        new U32BE(0),
        stack,
        outputAmount,
        hashCache,
      );

      // Evaluate the script
      const result = scriptInterpreter.evalScript();
      expect(scriptInterpreter.errStr).toBe("");
      expect(!!result.value).toBe(true);
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
        "../test-vectors/script_interpreter.json",
      );
      const jsonString = fs.readFileSync(filePath, "utf-8");
      const testScripts: TestScript[] = JSON.parse(jsonString).scripts;
      let tx: Tx;

      beforeEach(() => {
        tx = new Tx(
          new U8(0),
          [
            new TxIn(
              FixedBuf.alloc(32, 0),
              new U32BE(0),
              new Script(),
              new U32BE(0xffffffff),
            ),
          ],
          [new TxOut(new U64BE(0), new Script())],
          new U32BE(0),
        );
      });

      for (const testScript of testScripts) {
        test(testScript.name, () => {
          const script = Script.fromString(testScript.script);
          const hashCache = new HashCache();
          const scriptInterpreter = ScriptInterpreter.fromScriptTx(
            script,
            tx,
            new U32BE(0),
            hashCache,
          );
          scriptInterpreter.evalScript();

          expect(scriptInterpreter.errStr).toEqual(testScript.expected_error);
          expect(
            scriptInterpreter.returnValue &&
              WebBuf.from(scriptInterpreter.returnValue).toString("hex"),
          ).toBe(testScript.expected_return_value);
          expect(scriptInterpreter.returnSuccess).toBe(
            testScript.expected_success,
          );
        });
      }
    });
  });
});
