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
import TxIn from "../src/tx-in";

describe("TxVerifier", () => {
  let txBuilder: TxBuilder;
  let txSigner: TxSigner;
  let txOutBnMap: TxOutBnMap;
  let pkhKeyMap: PkhKeyMap;

  describe("pkh", () => {
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
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify a tx", () => {
      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, 0n);
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, 0n);
      const verifiedInput = txVerifier.verifyInputScript(0);
      expect(verifiedInput).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });

    test("should sign and verify a tx with two inputs", () => {
      const txOut = new TxOut(BigInt(100), Script.fromEmpty());
      txBuilder.addOutput(txOut);
      txBuilder.addOutput(txOut);

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

      const txVerifier = new TxVerifier(tx, txOutBnMap, 0n);
      const verifiedInput1 = txVerifier.verifyInputScript(0);
      expect(verifiedInput1).toBe(true);
      const verifiedInput2 = txVerifier.verifyInputScript(1);
      expect(verifiedInput2).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhx 1h unexpired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx1hOutput(pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify unexpired pkhx 1h", () => {
      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, 0n);
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, 0n);
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhx 1h expired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx1hOutput(pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify expired pkhx 1h", () => {
      const expiredInputScript = Script.fromExpiredPkhxInput();
      const txIn = new TxIn(
        Buffer.alloc(32),
        0,
        expiredInputScript,
        Script.PKHX_1H_LOCK_REL,
      );
      txBuilder.addInput(txIn, 100n);

      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        BigInt(Script.PKHX_1H_LOCK_REL),
      );
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isExpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        BigInt(Script.PKHX_1H_LOCK_REL),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhx 90d unexpired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx90dOutput(pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify unexpired pkhx 90d", () => {
      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, 0n);
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, 0n);
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhx 90d expired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx90dOutput(pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify expired pkhx 90d", () => {
      const expiredInputScript = Script.fromExpiredPkhxInput();
      const txIn = new TxIn(
        Buffer.alloc(32),
        0,
        expiredInputScript,
        Script.PKHX_90D_LOCK_REL,
      );
      txBuilder.addInput(txIn, 100n);

      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        BigInt(Script.PKHX_90D_LOCK_REL),
      );
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isExpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        BigInt(Script.PKHX_90D_LOCK_REL),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhxr 1h 40m unexpired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr1h40mOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify unexpired pkhx 1h", () => {
      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, 0n);
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, 0n);
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhxr 1h 40m recoverable", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr1h40mOutput(Buffer.alloc(32), pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify recoverable pkhxr 1h", () => {
      const recoveryInputScript = Script.fromRecoveryPkhxrInputPlaceholder();
      const txIn = new TxIn(
        Buffer.alloc(32),
        0,
        recoveryInputScript,
        Script.PKHXR_1H_40M_R_LOCK_REL,
      );
      txBuilder.addInput(txIn, 100n);

      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        BigInt(Script.PKHXR_1H_40M_R_LOCK_REL),
      );
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isRecoveryPkhxrInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        BigInt(Script.PKHXR_1H_40M_R_LOCK_REL),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhxr 1h 40m expired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr1h40mOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify expired pkhxr 1h 40m", () => {
      const expiredInputScript = Script.fromExpiredPkhxrInput();
      const txIn = new TxIn(
        Buffer.alloc(32),
        0,
        expiredInputScript,
        Script.PKHXR_1H_40M_X_LOCK_REL,
      );
      txBuilder.addInput(txIn, 100n);

      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        BigInt(Script.PKHXR_1H_40M_X_LOCK_REL),
      );
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isExpiredPkhxrInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        BigInt(Script.PKHXR_1H_40M_X_LOCK_REL),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhxr 90d 60d unexpired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr90d60dOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify unexpired pkhxr 1h", () => {
      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, 0n);
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, 0n);
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe.only("pkhxr 90d 60d expired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr90d60dOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(BigInt(100), script);
        const txOutBn = new TxOutBn(txOut, 0n);
        txOutBnMap.add(txOutBn, Buffer.alloc(32), i);
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, 0n);
    });

    test("should sign and verify expired pkhxr 90d 60d", () => {
      const expiredInputScript = Script.fromExpiredPkhxrInput();
      const txIn = new TxIn(
        Buffer.alloc(32),
        0,
        expiredInputScript,
        Script.PKHXR_90D_60D_X_LOCK_REL,
      );
      txBuilder.addInput(txIn, 100n);

      const txOut = new TxOut(BigInt(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build().unwrap();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value).toBe(BigInt(50));
      expect(tx.outputs[1].value).toBe(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        BigInt(Script.PKHXR_90D_60D_X_LOCK_REL),
      );
      const signed = txSigner.sign(0);
      expect(signed.ok).toBe(true);
      expect(tx.inputs[0].script.isExpiredPkhxrInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        BigInt(Script.PKHXR_90D_60D_X_LOCK_REL),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(0);
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(0);
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });
});
