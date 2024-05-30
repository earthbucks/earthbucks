import { Tx } from "./tx.js";
import { PkhKeyMap } from "./pkh-key-map.js";
import { TxOutBnMap } from "./tx-out-bn-map.js";
import { TxSignature } from "./tx-signature.js";
import { EbxBuffer } from "./ebx-buffer";
import { PubKey } from "./pub-key.js";
import { Result, Ok, Err } from "earthbucks-opt-res";
import { Script } from "./script.js";
import { KeyPair } from "./key-pair.js";

export class TxSigner {
  public tx: Tx;
  public pkhKeyMap: PkhKeyMap;
  public txOutMap: TxOutBnMap;
  public workingBlockNum: bigint;

  constructor(
    tx: Tx,
    txOutMap: TxOutBnMap,
    pkhKeyMap: PkhKeyMap,
    workingBlockNum: bigint,
  ) {
    this.tx = tx;
    this.txOutMap = txOutMap;
    this.pkhKeyMap = pkhKeyMap;
    this.workingBlockNum = workingBlockNum;
  }

  sign(nIn: number): Result<Tx, string> {
    const txInput = this.tx.inputs[nIn];
    const txOutHash = txInput.inputTxId;
    const outputIndex = txInput.inputTxNOut;
    const txOutBn = this.txOutMap.get(txOutHash, outputIndex);
    if (!txOutBn) {
      return Err("tx_out not found");
    }
    const txOut = txOutBn.txOut;
    const prevBlockNum = txOutBn.blockNum;

    if (txOut.script.isPkhOutput()) {
      const pkh_buf = txOut.script.chunks[2].buf as EbxBuffer;
      const inputScript = txInput.script;
      if (!inputScript.isPkhInput()) {
        return Err("expected pkh input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh_buf);
      if (!keyPair) {
        return Err("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toIsoBuf();

      const outputScriptBuf = txOut.script.toIsoBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toIsoBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toIsoBuf();

      inputScript.chunks[0].buf = EbxBuffer.from(sigBuf);
      inputScript.chunks[1].buf = EbxBuffer.from(pubKeyBuf);
    } else if (txOut.script.isPkhx90dOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as EbxBuffer;
      const expired = Script.isPkhx90dExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxInput()) {
          // no need to sign expired pkhx
          return Ok(this.tx);
        } else {
          return Err("expected expired pkhx input");
        }
      }
      if (!inputScript.isUnexpiredPkhxInput()) {
        return Err("expected unexpired pkhx input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh_buf);
      if (!keyPair) {
        return Err("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toIsoBuf();

      const outputScriptBuf = txOut.script.toIsoBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toIsoBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toIsoBuf();

      inputScript.chunks[0].buf = EbxBuffer.from(sigBuf);
      inputScript.chunks[1].buf = EbxBuffer.from(pubKeyBuf);
    } else if (txOut.script.isPkhx1hOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as EbxBuffer;
      const expired = Script.isPkhx1hExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxInput()) {
          // no need to sign expired pkhx
          return Ok(this.tx);
        } else {
          return Err("expected expired pkhx input");
        }
      }
      if (!inputScript.isUnexpiredPkhxInput()) {
        return Err("expected unexpired pkhx input placeholder");
      }
      const keyPair = this.pkhKeyMap.get(pkh_buf);
      if (!keyPair) {
        return Err("key not found");
      }
      const pubKeyBuf = keyPair.pubKey.toIsoBuf();

      const outputScriptBuf = txOut.script.toIsoBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toIsoBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toIsoBuf();

      inputScript.chunks[0].buf = EbxBuffer.from(sigBuf);
      inputScript.chunks[1].buf = EbxBuffer.from(pubKeyBuf);
    } else if (txOut.script.isPkhxr1h40mOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as EbxBuffer;
      const rpkh_buf = txOut.script.chunks[13].buf as EbxBuffer;
      const expired = Script.isPkhxr1h40mExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxrInput()) {
          // no need to sign expired pkhx
          return Ok(this.tx);
        } else {
          return Err("expected expired pkhx input");
        }
      }

      let keyPair: KeyPair;
      if (inputScript.isRecoveryPkhxrInput()) {
        const recoverable = Script.isPkhxr1h40mRecoverable(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (!recoverable) {
          return Err("expected recoverable pkhx input");
        }
        const res = this.pkhKeyMap.get(rpkh_buf);
        if (res) {
          keyPair = res;
        } else {
          return Err("key not found");
        }
      } else if (inputScript.isUnexpiredPkhxrInput()) {
        const res = this.pkhKeyMap.get(pkh_buf);
        if (res) {
          keyPair = res;
        } else {
          return Err("key not found");
        }
      } else {
        return Err("expected unexpired pkhx input placeholder");
      }

      const pubKeyBuf = keyPair.pubKey.toIsoBuf();
      const outputScriptBuf = txOut.script.toIsoBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toIsoBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toIsoBuf();

      inputScript.chunks[0].buf = EbxBuffer.from(sigBuf);
      inputScript.chunks[1].buf = EbxBuffer.from(pubKeyBuf);
    } else if (txOut.script.isPkhxr90d60dOutput()) {
      const pkh_buf = txOut.script.chunks[3].buf as EbxBuffer;
      const rpkh_buf = txOut.script.chunks[13].buf as EbxBuffer;
      const expired = Script.isPkhxr90d60dExpired(
        this.workingBlockNum,
        prevBlockNum,
      );
      const inputScript = txInput.script;
      if (expired) {
        if (inputScript.isExpiredPkhxrInput()) {
          // no need to sign expired pkhx
          return Ok(this.tx);
        } else {
          return Err("expected expired pkhx input");
        }
      }

      let keyPair: KeyPair;
      if (inputScript.isRecoveryPkhxrInput()) {
        const recoverable = Script.isPkhxr90d60dRecoverable(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (!recoverable) {
          return Err("expected recoverable pkhx input");
        }
        const res = this.pkhKeyMap.get(rpkh_buf);
        if (res) {
          keyPair = res;
        } else {
          return Err("key not found");
        }
      } else if (inputScript.isUnexpiredPkhxrInput()) {
        const res = this.pkhKeyMap.get(pkh_buf);
        if (res) {
          keyPair = res;
        } else {
          return Err("key not found");
        }
      } else {
        return Err("expected unexpired pkhx input placeholder");
      }

      const pubKeyBuf = keyPair.pubKey.toIsoBuf();
      const outputScriptBuf = txOut.script.toIsoBuf();
      const outputAmount = txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        keyPair.privKey.toIsoBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toIsoBuf();

      inputScript.chunks[0].buf = EbxBuffer.from(sigBuf);
      inputScript.chunks[1].buf = EbxBuffer.from(pubKeyBuf);
    } else {
      return Err("unsupported script type");
    }

    return Ok(this.tx);
  }

  signAll(): Result<Tx, string> {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      const res = this.sign(i);
      if (res.err) {
        return Err("sign_all: " + res.err);
      }
    }
    return Ok(this.tx);
  }
}
