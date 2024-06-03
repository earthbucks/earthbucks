import { describe, expect, test, beforeEach, it } from "vitest";
import { TxBuilder } from "../src/tx-builder.js";
import { TxOutBnMap } from "../src/tx-out-bn-map.js";
import { TxOut } from "../src/tx-out.js";
import { Script } from "../src/script.js";
import { KeyPair } from "../src/key-pair.js";
import { Pkh } from "../src/pkh.js";
import { PkhKeyMap } from "../src/pkh-key-map.js";
import { TxSigner } from "../src/tx-signer.js";
import { TxVerifier } from "../src/tx-verifier.js";
import { SysBuf, FixedBuf } from "../src/ebx-buf.js";
import { TxOutBn } from "../src/tx-out-bn.js";
import { TxIn } from "../src/tx-in.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhOutput(pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify a tx", () => {
      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U64(0n));
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();

      const txVerifier = new TxVerifier(tx, txOutBnMap, new U64(0n));
      const verifiedInput = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInput).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });

    test("should sign and verify a tx with two inputs", () => {
      const txOut = new TxOut(new U64(100), Script.fromEmpty());
      txBuilder.addOutput(txOut);
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(2);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(100));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(100));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U64(0n));
      const signed1 = txSigner.sign(new U32(0));
      expect(signed1).toBeTruthy();
      const signed2 = txSigner.sign(new U32(1));
      expect(signed2).toBeTruthy();

      const txVerifier = new TxVerifier(tx, txOutBnMap, new U64(0n));
      const verifiedInput1 = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInput1).toBe(true);
      const verifiedInput2 = txVerifier.verifyInputScript(new U32(1));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx1hOutput(pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify unexpired pkhx 1h", () => {
      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U64(0n));
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, new U64(0n));
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx1hOutput(pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify expired pkhx 1h", () => {
      const expiredInputScript = Script.fromExpiredPkhxInput();
      const txIn = new TxIn(
        FixedBuf.alloc(32),
        new U32(0),
        expiredInputScript,
        Script.PKHX_1H_LOCK_REL,
      );
      txBuilder.addInput(txIn, new U64(100n));

      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        new U64(Script.PKHX_1H_LOCK_REL.bn),
      );
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isExpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        new U64(Script.PKHX_1H_LOCK_REL.bn),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx90dOutput(pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify unexpired pkhx 90d", () => {
      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U64(0n));
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, new U64(0n));
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhx90dOutput(pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify expired pkhx 90d", () => {
      const expiredInputScript = Script.fromExpiredPkhxInput();
      const txIn = new TxIn(
        FixedBuf.alloc(32),
        new U32(0),
        expiredInputScript,
        Script.PKHX_90D_LOCK_REL,
      );
      txBuilder.addInput(txIn, new U64(100n));

      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        new U64(Script.PKHX_90D_LOCK_REL.bn),
      );
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isExpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        new U64(Script.PKHX_90D_LOCK_REL.bn),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr1h40mOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify unexpired pkhx 1h", () => {
      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U64(0n));
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, new U64(0n));
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr1h40mOutput(FixedBuf.alloc(32), pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify recoverable pkhxr 1h", () => {
      const recoveryInputScript = Script.fromRecoveryPkhxrInputPlaceholder();
      const txIn = new TxIn(
        FixedBuf.alloc(32),
        new U32(0),
        recoveryInputScript,
        Script.PKHXR_1H_40M_R_LOCK_REL,
      );
      txBuilder.addInput(txIn, new U64(100n));

      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        new U64(Script.PKHXR_1H_40M_R_LOCK_REL.bn),
      );
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isRecoveryPkhxrInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        new U64(Script.PKHXR_1H_40M_R_LOCK_REL.bn),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr1h40mOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify expired pkhxr 1h 40m", () => {
      const expiredInputScript = Script.fromExpiredPkhxrInput();
      const txIn = new TxIn(
        FixedBuf.alloc(32),
        new U32(0),
        expiredInputScript,
        Script.PKHXR_1H_40M_X_LOCK_REL,
      );
      txBuilder.addInput(txIn, new U64(100n));

      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        new U64(Script.PKHXR_1H_40M_X_LOCK_REL.bn),
      );
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isExpiredPkhxrInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        new U64(Script.PKHXR_1H_40M_X_LOCK_REL.bn),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr90d60dOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify unexpired pkhxr 1h", () => {
      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(tx, txOutBnMap, pkhKeyMap, new U64(0n));
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isUnexpiredPkhxInput()).toBe(true);

      const txVerifier = new TxVerifier(tx, txOutBnMap, new U64(0n));
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhxr 90d 60d recovery", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr90d60dOutput(
          FixedBuf.alloc(32),
          pkh.buf,
        );
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify recovery pkhxr 90d 60d", () => {
      const recoveryInputScript = Script.fromRecoveryPkhxrInputPlaceholder();
      const txIn = new TxIn(
        FixedBuf.alloc(32),
        new U32(0),
        recoveryInputScript,
        Script.PKHXR_90D_60D_R_LOCK_REL,
      );
      txBuilder.addInput(txIn, new U64(100n));

      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        new U64(Script.PKHXR_90D_60D_R_LOCK_REL.bn),
      );
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isRecoveryPkhxrInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        new U64(Script.PKHXR_90D_60D_R_LOCK_REL.bn),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
      expect(verifiedInputLockRel).toBe(true);

      const verifiedScripts = txVerifier.verifyInputs();
      expect(verifiedScripts).toBe(true);

      const verifiedOutputValues = txVerifier.verifyOutputValues();
      expect(verifiedOutputValues).toBe(true);

      const verified = txVerifier.verify();
      expect(verified).toBe(true);
    });
  });

  describe("pkhxr 90d 60d expired", () => {
    beforeEach(() => {
      txOutBnMap = new TxOutBnMap();
      pkhKeyMap = new PkhKeyMap();
      // generate 5 keys, 5 outputs, and add them to the txOutMap
      for (let i = 0; i < 5; i++) {
        const key = KeyPair.fromRandom();
        const pkh = Pkh.fromPubKeyBuf(key.pubKey.toEbxBuf());
        pkhKeyMap.add(key, pkh.buf);
        const script = Script.fromPkhxr90d60dOutput(pkh.buf, pkh.buf);
        const txOut = new TxOut(new U64(100), script);
        const txOutBn = new TxOutBn(txOut, new U64(0n));
        txOutBnMap.add(txOutBn, FixedBuf.alloc(32), new U32(i));
      }

      const changeScript = Script.fromEmpty();
      txBuilder = new TxBuilder(txOutBnMap, changeScript, new U64(0n));
    });

    test("should sign and verify expired pkhxr 90d 60d", () => {
      const expiredInputScript = Script.fromExpiredPkhxrInput();
      const txIn = new TxIn(
        FixedBuf.alloc(32),
        new U32(0),
        expiredInputScript,
        Script.PKHXR_90D_60D_X_LOCK_REL,
      );
      txBuilder.addInput(txIn, new U64(100n));

      const txOut = new TxOut(new U64(50), Script.fromEmpty());
      txBuilder.addOutput(txOut);

      const tx = txBuilder.build();

      expect(tx.inputs.length).toBe(1);
      expect(tx.outputs.length).toBe(2);
      expect(tx.outputs[0].value.bn).toEqual(BigInt(50));
      expect(tx.outputs[1].value.bn).toEqual(BigInt(50));

      txSigner = new TxSigner(
        tx,
        txOutBnMap,
        pkhKeyMap,
        new U64(Script.PKHXR_90D_60D_X_LOCK_REL.bn),
      );
      const signed = txSigner.sign(new U32(0));
      expect(signed).toBeTruthy();
      expect(tx.inputs[0].script.isExpiredPkhxrInput()).toBe(true);

      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        new U64(Script.PKHXR_90D_60D_X_LOCK_REL.bn),
      );
      const verifiedInputScript = txVerifier.verifyInputScript(new U32(0));
      expect(verifiedInputScript).toBe(true);

      const verifiedInputLockRel = txVerifier.verifyInputLockRel(new U32(0));
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
