import { Tx } from "./tx.js";
import { PkhKeyMap } from "./pkh-key-map.js";
import { TxOutBnMap } from "./tx-out-bn-map.js";
import { TxSignature } from "./tx-signature.js";
import { SysBuf } from "./buf.js";
import { PubKey } from "./pub-key.js";
import { Script } from "./script.js";
import { KeyPair } from "./key-pair.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import { GenericError } from "./error.js";

export class TxSigner {
  public tx: Tx;
  public pkhKeyMap: PkhKeyMap;
  public txOutMap: TxOutBnMap;
  public workingBlockNum: U64;

  constructor(
    tx: Tx,
    txOutMap: TxOutBnMap,
    pkhKeyMap: PkhKeyMap,
    workingBlockNum: U64,
  ) {
    this.tx = tx;
    this.txOutMap = txOutMap;
    this.pkhKeyMap = pkhKeyMap;
    this.workingBlockNum = workingBlockNum;
  }

  sign(nIn: U32): Tx {
    const txInput = this.tx.inputs[nIn.n];
    const txOutHash = txInput.inputTxId;
    const outputIndex = txInput.inputTxNOut;
    const txOutBn = this.txOutMap.get(txOutHash, outputIndex);
    if (!txOutBn) {
      throw new GenericError("tx_out not found");
    }
    const txOut = txOutBn.txOut;
    const prevBlockNum = txOutBn.blockNum;

    if (txOut.script.isPkhOutput()) {
      const pkh_buf = txOut.script.chunks[2].buf as SysBuf;
      const inputScript = txInput.script;
      if (!inputScript.isPkhInput()) {
        throw new GenericError("expected pkh input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh_buf);
      if (!keyPair) {
        throw new GenericError("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toBuf();

      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      inputScript.chunks[0].buf = SysBuf.from(sigBuf);
      inputScript.chunks[1].buf = SysBuf.from(pubKeyBuf);
    } else if (txOut.script.isPkhx90dOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as SysBuf;
      const expired = Script.isPkhx90dExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxInput()) {
          // no need to sign expired pkhx
          return this.tx;
        } else {
          throw new GenericError("expected expired pkhx input");
        }
      }
      if (!inputScript.isUnexpiredPkhxInput()) {
        throw new GenericError("expected unexpired pkhx input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh_buf);
      if (!keyPair) {
        throw new GenericError("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toBuf();

      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      inputScript.chunks[0].buf = SysBuf.from(sigBuf);
      inputScript.chunks[1].buf = SysBuf.from(pubKeyBuf);
    } else if (txOut.script.isPkhx1hOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as SysBuf;
      const expired = Script.isPkhx1hExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxInput()) {
          // no need to sign expired pkhx
          return this.tx;
        } else {
          throw new GenericError("expected expired pkhx input");
        }
      }
      if (!inputScript.isUnexpiredPkhxInput()) {
        throw new GenericError("expected unexpired pkhx input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh_buf);
      if (!keyPair) {
        throw new GenericError("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toBuf();

      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      inputScript.chunks[0].buf = SysBuf.from(sigBuf);
      inputScript.chunks[1].buf = SysBuf.from(pubKeyBuf);
    } else if (txOut.script.isPkhxr1h40mOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as SysBuf;
      const rpkh_buf = txOut.script.chunks[13].buf as SysBuf;
      const expired = Script.isPkhxr1h40mExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxrInput()) {
          // no need to sign expired pkhx
          return this.tx;
        } else {
          throw new GenericError("expected expired pkhx input");
        }
      }

      let keyPair: KeyPair;
      if (inputScript.isRecoveryPkhxrInput()) {
        const recoverable = Script.isPkhxr1h40mRecoverable(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (!recoverable) {
          throw new GenericError("expected recoverable pkhx input");
        }
        const res = this.pkhKeyMap.get(rpkh_buf);
        if (res) {
          keyPair = res;
        } else {
          throw new GenericError("key not found");
        }
      } else if (inputScript.isUnexpiredPkhxrInput()) {
        const res = this.pkhKeyMap.get(pkh_buf);
        if (res) {
          keyPair = res;
        } else {
          throw new GenericError("key not found");
        }
      } else {
        throw new GenericError("expected unexpired pkhx input placeholder");
      }

      const pubKeyBuf = keyPair.pubKey.toBuf();
      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      inputScript.chunks[0].buf = SysBuf.from(sigBuf);
      inputScript.chunks[1].buf = SysBuf.from(pubKeyBuf);
    } else if (txOut.script.isPkhxr90d60dOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as SysBuf;
      const rpkh_buf = txOut.script.chunks[13].buf as SysBuf;
      const expired = Script.isPkhxr90d60dExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxrInput()) {
          // no need to sign expired pkhx
          return this.tx;
        } else {
          throw new GenericError("expected expired pkhx input");
        }
      }

      let keyPair: KeyPair;
      if (inputScript.isRecoveryPkhxrInput()) {
        const recoverable = Script.isPkhxr90d60dRecoverable(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (!recoverable) {
          throw new GenericError("expected recoverable pkhx input");
        }
        const res = this.pkhKeyMap.get(rpkh_buf);
        if (res) {
          keyPair = res;
        } else {
          throw new GenericError("key not found");
        }
      } else if (inputScript.isUnexpiredPkhxrInput()) {
        const res = this.pkhKeyMap.get(pkh_buf);
        if (res) {
          keyPair = res;
        } else {
          throw new GenericError("key not found");
        }
      } else {
        throw new GenericError("expected unexpired pkhx input placeholder");
      }

      const pubKeyBuf = keyPair.pubKey.toBuf();
      const outputScriptBuf = txOut.script.toBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toBuf();

      inputScript.chunks[0].buf = SysBuf.from(sigBuf);
      inputScript.chunks[1].buf = SysBuf.from(pubKeyBuf);
    } else {
      throw new GenericError("unsupported script type");
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
