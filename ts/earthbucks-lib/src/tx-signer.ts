import type { Tx } from "./tx.js";
import type { PkhKeyMap } from "./pkh-key-map.js";
import type { TxOutBnMap } from "./tx-out-bn-map.js";
import { TxSignature } from "./tx-signature.js";
import { FixedBuf, WebBuf } from "./buf.js";
import { PubKey } from "./pub-key.js";
import { Script } from "./script.js";
import type { KeyPair } from "./key-pair.js";
import type { U64 } from "./numbers.js";
import { U32 } from "./numbers.js";
import type { TxIn } from "./tx-in.js";
import type { ScriptChunk } from "./script-chunk.js";
import { Pkh } from "./pkh.js";

export class TxSigner {
  public tx: Tx;
  public pkhKeyMap: PkhKeyMap;
  public txOutBnMap: TxOutBnMap;
  public workingBlockNum: U32;

  constructor(
    tx: Tx,
    txOutBnMap: TxOutBnMap,
    pkhKeyMap: PkhKeyMap,
    workingBlockNum: U32,
  ) {
    this.tx = tx;
    this.txOutBnMap = txOutBnMap;
    this.pkhKeyMap = pkhKeyMap;
    this.workingBlockNum = workingBlockNum;
  }

  sign(nIn: U32): Tx {
    if (nIn.n >= this.tx.inputs.length) {
      throw new Error("input index out of bounds");
    }
    const txInput = this.tx.inputs[nIn.n] as TxIn;
    const txOutHash = txInput.inputTxId;
    const outputIndex = txInput.inputTxNOut;
    const txOutBn = this.txOutBnMap.get(txOutHash, outputIndex);
    if (!txOutBn) {
      throw new Error("tx_out not found");
    }
    const txOut = txOutBn.txOut;
    const prevBlockNum = txOutBn.blockNum;

    if (txOut.script.isPkhOutput()) {
      const pkhBuf = txOut.script.chunks[2]?.buf as WebBuf;
      const pkh = Pkh.fromBuf(FixedBuf.fromBuf(32, pkhBuf));
      const inputScript = txInput.script;
      if (!inputScript.isPkhInput()) {
        throw new Error("expected pkh input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh);
      if (!keyPair) {
        throw new Error("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toBuf();

      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey,
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      (inputScript.chunks[0] as ScriptChunk).buf = WebBuf.from(sigBuf);
      (inputScript.chunks[1] as ScriptChunk).buf = WebBuf.from(pubKeyBuf.buf);
    } else if (txOut.script.isPkhx90dOutput()) {
      const pkhBuf = txOut.script.chunks[3]?.buf as WebBuf;
      const pkh = Pkh.fromBuf(FixedBuf.fromBuf(32, pkhBuf));
      const expired = Script.isPkhx90dExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxInput()) {
          // no need to sign expired pkhx
          return this.tx;
        }
        throw new Error("expected expired pkhx input");
      }
      if (!inputScript.isUnexpiredPkhxInput()) {
        throw new Error("expected unexpired pkhx input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh);
      if (!keyPair) {
        throw new Error("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toBuf();

      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey,
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      (inputScript.chunks[0] as ScriptChunk).buf = WebBuf.from(sigBuf);
      (inputScript.chunks[1] as ScriptChunk).buf = WebBuf.from(pubKeyBuf.buf);
    } else if (txOut.script.isPkhx1hOutput()) {
      const pkhBuf = txOut.script.chunks[3]?.buf as WebBuf;
      const pkh = Pkh.fromBuf(FixedBuf.fromBuf(32, pkhBuf));
      const expired = Script.isPkhx1hExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxInput()) {
          // no need to sign expired pkhx
          return this.tx;
        }
        throw new Error("expected expired pkhx input");
      }
      if (!inputScript.isUnexpiredPkhxInput()) {
        throw new Error("expected unexpired pkhx input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh);
      if (!keyPair) {
        throw new Error("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toBuf();

      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey,
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      (inputScript.chunks[0] as ScriptChunk).buf = WebBuf.from(sigBuf);
      (inputScript.chunks[1] as ScriptChunk).buf = WebBuf.from(pubKeyBuf.buf);
    } else if (txOut.script.isPkhxr1h40mOutput()) {
      const pkhBuf = txOut.script.chunks[3]?.buf as WebBuf;
      const pkh = Pkh.fromBuf(FixedBuf.fromBuf(32, pkhBuf));
      const rpkhBuf = txOut.script.chunks[13]?.buf as WebBuf;
      const rpkh = Pkh.fromBuf(FixedBuf.fromBuf(32, rpkhBuf));
      const expired = Script.isPkhxr1h40mExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxrInput()) {
          // no need to sign expired pkhx
          return this.tx;
        }
        throw new Error("expected expired pkhx input");
      }

      let keyPair: KeyPair;
      if (inputScript.isRecoveryPkhxrInput()) {
        const recoverable = Script.isPkhxr1h40mRecoverable(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (!recoverable) {
          throw new Error("expected recoverable pkhx input");
        }
        const res = this.pkhKeyMap.get(rpkh);
        if (res) {
          keyPair = res;
        } else {
          throw new Error("key not found");
        }
      } else if (inputScript.isUnexpiredPkhxrInput()) {
        const res = this.pkhKeyMap.get(pkh);
        if (res) {
          keyPair = res;
        } else {
          throw new Error("key not found");
        }
      } else {
        throw new Error("expected unexpired pkhx input placeholder");
      }

      const pubKeyBuf = keyPair.pubKey.toBuf();
      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey,
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      (inputScript.chunks[0] as ScriptChunk).buf = WebBuf.from(sigBuf);
      (inputScript.chunks[1] as ScriptChunk).buf = WebBuf.from(pubKeyBuf.buf);
    } else if (txOut.script.isPkhxr90d60dOutput()) {
      const pkhBuf = txOut.script.chunks[3]?.buf as WebBuf;
      const pkh = Pkh.fromBuf(FixedBuf.fromBuf(32, pkhBuf));
      const rpkhBuf = txOut.script.chunks[13]?.buf as WebBuf;
      const rpkh = Pkh.fromBuf(FixedBuf.fromBuf(32, rpkhBuf));
      const expired = Script.isPkhxr90d60dExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxrInput()) {
          // no need to sign expired pkhx
          return this.tx;
        }
        throw new Error("expected expired pkhx input");
      }

      let keyPair: KeyPair;
      if (inputScript.isRecoveryPkhxrInput()) {
        const recoverable = Script.isPkhxr90d60dRecoverable(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (!recoverable) {
          throw new Error("expected recoverable pkhx input");
        }
        const res = this.pkhKeyMap.get(rpkh);
        if (res) {
          keyPair = res;
        } else {
          throw new Error("key not found");
        }
      } else if (inputScript.isUnexpiredPkhxrInput()) {
        const res = this.pkhKeyMap.get(pkh);
        if (res) {
          keyPair = res;
        } else {
          throw new Error("key not found");
        }
      } else {
        throw new Error("expected unexpired pkhx input placeholder");
      }

      const pubKeyBuf = keyPair.pubKey.toBuf();
      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey,
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      (inputScript.chunks[0] as ScriptChunk).buf = WebBuf.from(sigBuf);
      (inputScript.chunks[1] as ScriptChunk).buf = WebBuf.from(pubKeyBuf.buf);
    } else {
      throw new Error("unsupported script type");
    }

    return this.tx;
  }

  signAll(): Tx {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      this.sign(new U32(i));
    }
    return this.tx;
  }
}
