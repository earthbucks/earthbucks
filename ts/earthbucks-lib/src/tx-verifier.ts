import { HashCache } from "./tx.js";
import type { Tx } from "./tx.js";
import type { TxOutBnMap } from "./tx-out-bn-map.js";
import { ScriptInterpreter } from "./script-interpreter.js";
import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";
import type { TxIn } from "./tx-in.js";
import { Err, isErr, isOk, Ok, Result } from "@ryanxcharles/result";
import { ScriptTemplateType } from "./script.js";

export class TxVerifier {
  public tx: Tx;
  public txOutBnMap: TxOutBnMap;
  public hashCache: HashCache;
  public blockNum: U32BE;

  constructor(tx: Tx, txOutBnMap: TxOutBnMap, blockNum: U32BE) {
    this.tx = tx;
    this.txOutBnMap = txOutBnMap;
    this.hashCache = new HashCache();
    this.blockNum = blockNum;
  }

  evalInputScript(nIn: U32BE): Result<WebBuf, string> {
    const txInput = this.tx.inputs[nIn.n] as TxIn;
    const txOutHash = txInput.inputTxId;
    const outputIndex = txInput.inputTxNOut;
    const txOutBn = this.txOutBnMap.get(txOutHash, outputIndex);
    if (!txOutBn) {
      return Err(
        `Failed to find txOutBn for input script ${nIn.n}: ${txOutHash.toHex()} ${outputIndex.n}`,
      );
    }
    const outputScript = txOutBn.txOut.script;
    const inputScript = txInput.script;
    if (!inputScript.isPushOnly()) {
      return Err(`Input script ${nIn.n} is not push only`);
    }
    const stack = inputScript.chunks.map((chunk) => chunk.getData());
    const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
      outputScript,
      this.tx,
      nIn,
      stack,
      txOutBn.txOut.value,
      this.hashCache,
    );
    const result = scriptInterpreter.evalScript();
    if (!isOk(result)) {
      return Err(`Failed to verify input script ${nIn.n}: ${result.error}`);
    }
    return result;
  }

  verifyInputLockRel(nIn: U32BE): Result<void, string> {
    const txInput = this.tx.inputs[nIn.n] as TxIn;
    const txId = txInput.inputTxId;
    const txOutNum = txInput.inputTxNOut;
    const txOutBn = this.txOutBnMap.get(txId, txOutNum);
    if (!txOutBn) {
      return Err(
        `Failed to find txOutBn for input lockRel ${nIn.n}: ${txId.toHex()} ${txOutNum.n}`,
      );
    }
    const lockRel = txInput.lockRel;
    const prevBlockNum = txOutBn.blockNum;
    const isValid = this.blockNum.bn >= prevBlockNum.bn + lockRel.bn;
    if (!isValid) {
      return Err(
        `Input lockRel ${nIn.n} is invalid: ${lockRel.bn} ${prevBlockNum.bn} ${this.blockNum.bn}`,
      );
    }
    return Ok(undefined);
  }

  verifyInputs(): Result<void, string> {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      const scriptResult = this.evalInputScript(new U32BE(i));
      if (isErr(scriptResult)) {
        return Err(`Failed to verify input script ${i}: ${scriptResult.error}`);
      }
      const lockRelResult = this.verifyInputLockRel(new U32BE(i));
      if (isErr(lockRelResult)) {
        return Err(
          `Failed to verify input lockRel ${i}: ${lockRelResult.error}`,
        );
      }
    }
    return Ok(undefined);
  }

  verifyNoDoubleSpend(): Result<void, string> {
    const spentOutputs = new Set();
    for (let i = 0; i < this.tx.inputs.length; i++) {
      const input = this.tx.inputs[i] as TxIn;
      const txOut = this.txOutBnMap.get(input.inputTxId, input.inputTxNOut);
      if (!txOut) {
        return Err(
          `Failed to find txOut for double spend verification for input ${i}: ${input.inputTxId.toHex()} ${input.inputTxNOut.n}`,
        );
      }
      if (spentOutputs.has(txOut)) {
        return Err(
          `Double spend detected for input ${i}: ${input.inputTxId.toHex()} ${input.inputTxNOut.n}`,
        );
      }
      spentOutputs.add(txOut);
    }
    return Ok(undefined);
  }

  verifyOutputValues(): Result<void, string> {
    let totalOutputValue = new U64BE(0);
    let totalInputValue = new U64BE(0);
    for (const output of this.tx.outputs) {
      totalOutputValue = totalOutputValue.add(output.value);
    }
    for (let i = 0; i < this.tx.inputs.length; i++) {
      const input = this.tx.inputs[i] as TxIn;
      const txOutBn = this.txOutBnMap.get(input.inputTxId, input.inputTxNOut);
      if (!txOutBn) {
        return Err(
          `Failed to find txOutBn for output value verification for input ${i}: ${input.inputTxId.toHex()} ${input.inputTxNOut.n}`,
        );
      }
      totalInputValue = totalInputValue.add(txOutBn.txOut.value);
    }
    const isValid = totalOutputValue.bn === totalInputValue.bn;
    if (!isValid) {
      return Err(
        `Output value ${totalOutputValue.bn} does not match input value ${totalInputValue.bn}`,
      );
    }
    return Ok(undefined);
  }

  verifyIsNotMintTx(): Result<void, string> {
    if (this.tx.isMintTx()) {
      return Err("Is mint transaction, but mint transaction not valid here");
    }
    return Ok(undefined);
  }

  verifyLockAbs(): Result<void, string> {
    if (this.tx.lockAbs > this.blockNum) {
      return Err(
        `Absolute lock time ${this.tx.lockAbs} is greater than block time ${this.blockNum}`,
      );
    }
    return Ok(undefined);
  }

  verifyTx(): Result<void, string> {
    const resVerifyLockAbs = this.verifyLockAbs();
    if (isErr(resVerifyLockAbs)) {
      return Err(`Failed to verify lockAbs: ${resVerifyLockAbs.error}`);
    }
    const resVerifyIsNotMintTx = this.verifyIsNotMintTx();
    if (isErr(resVerifyIsNotMintTx)) {
      return Err(
        `Failed to verify is not mint tx: ${resVerifyIsNotMintTx.error}`,
      );
    }
    const resVerifyNoDoubleSpend = this.verifyNoDoubleSpend();
    if (isErr(resVerifyNoDoubleSpend)) {
      return Err(
        `Failed to verify no double spend: ${resVerifyNoDoubleSpend.error}`,
      );
    }
    const resVerifyInputs = this.verifyInputs();
    if (isErr(resVerifyInputs)) {
      return Err(`Failed to verify inputs: ${resVerifyInputs.error}`);
    }
    const resVerifyOutputValues = this.verifyOutputValues();
    if (isErr(resVerifyOutputValues)) {
      return Err(
        `Failed to verify output values: ${resVerifyOutputValues.error}`,
      );
    }
    return Ok(undefined);
  }

  getInputScriptTemplateType(nIn: U32BE): ScriptTemplateType {
    if (this.tx.isMintTx() && nIn.n === 0) {
      return "mint-input";
    }
    const txInput = this.tx.inputs[nIn.n] as TxIn;
    const txOutBn = this.txOutBnMap.get(txInput.inputTxId, txInput.inputTxNOut);
    if (!txOutBn) {
      throw new Error(
        `Failed to find txOutBn for input template type ${nIn.n}: ${txInput.inputTxId.toHex()} ${txInput.inputTxNOut.n}`,
      );
    }
    const outputTemplateType = txOutBn.txOut.script.getOutputTemplateType();
    if (outputTemplateType === "pkh-output") {
      if (txInput.script.isPkhInput()) {
        return "pkh-input";
      }
      throw new Error(
        `Invalid input template type for pkh-output: ${txInput.script.toString()}`,
      );
    }
    if (outputTemplateType === "pkhx1h-output") {
      if (txInput.script.isUnexpiredPkhxInput()) {
        return "pkhx1h-unexpired-input";
      }
      if (txInput.script.isExpiredPkhxInput()) {
        return "pkhx1h-expired-input";
      }
      throw new Error(
        `Invalid input template type for pkhx1h-output: ${txInput.script.toString()}`,
      );
    }
    if (outputTemplateType === "pkhx90d-output") {
      if (txInput.script.isUnexpiredPkhxInput()) {
        return "pkhx90d-unexpired-input";
      }
      if (txInput.script.isExpiredPkhxInput()) {
        return "pkhx90d-expired-input";
      }
      throw new Error(
        `Invalid input template type for pkhx90d-output: ${txInput.script.toString()}`,
      );
    }
    if (outputTemplateType === "pkhxr1h40m-output") {
      if (txInput.script.isUnexpiredPkhxInput()) {
        return "pkhxr1h40m-unexpired-input";
      }
      if (txInput.script.isRecoveryPkhxrInput()) {
        return "pkhxr1h40m-recovery-input";
      }
      if (txInput.script.isExpiredPkhxInput()) {
        return "pkhxr1h40m-expired-input";
      }
      throw new Error(
        `Invalid input template type for pkhxr1h40m-output: ${txInput.script.toString()}`,
      );
    }
    if (outputTemplateType === "pkhxr90d60d-output") {
      if (txInput.script.isUnexpiredPkhxInput()) {
        return "pkhxr90d60d-unexpired-input";
      }
      if (txInput.script.isRecoveryPkhxrInput()) {
        return "pkhxr90d60d-recovery-input";
      }
      if (txInput.script.isExpiredPkhxInput()) {
        return "pkhxr90d60d-expired-input";
      }
      throw new Error(
        `Invalid input template type for pkhxr90d60d-output: ${txInput.script.toString()}`,
      );
    }
    throw new Error(`Invalid output template type: ${outputTemplateType}`);
  }
}
