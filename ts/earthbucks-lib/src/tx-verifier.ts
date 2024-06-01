import { Tx, HashCache } from "./tx.js";
import { TxOutBnMap } from "./tx-out-bn-map.js";
import { ScriptInterpreter } from "./script-interpreter.js";
import { SysBuf } from "./iso-buf.js";

export class TxVerifier {
  public tx: Tx;
  public txOutBnMap: TxOutBnMap;
  public hashCache: HashCache;
  public blockNum: bigint;

  constructor(tx: Tx, txOutBnMap: TxOutBnMap, blockNum: bigint) {
    this.tx = tx;
    this.txOutBnMap = txOutBnMap;
    this.hashCache = new HashCache();
    this.blockNum = blockNum;
  }

  verifyInputScript(nIn: number): boolean {
    const txInput = this.tx.inputs[nIn];
    const txOutHash = txInput.inputTxId;
    const outputIndex = txInput.inputTxNOut;
    const txOutBn = this.txOutBnMap.get(txOutHash, outputIndex);
    if (!txOutBn) {
      return false;
    }
    const outputScript = txOutBn.txOut.script;
    const inputScript = txInput.script;
    if (!inputScript.isPushOnly()) {
      return false;
    }
    const stack = inputScript.chunks.map((chunk) => chunk.getData().unwrap());
    const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
      outputScript,
      this.tx,
      nIn,
      stack,
      txOutBn.txOut.value,
      this.hashCache,
    );
    const result = scriptInterpreter.evalScript();
    return result;
  }

  verifyInputLockRel(nIn: number): boolean {
    const txInput = this.tx.inputs[nIn];
    const txId = txInput.inputTxId;
    const txOutNum = txInput.inputTxNOut;
    const txOutBn = this.txOutBnMap.get(txId, txOutNum);
    if (!txOutBn) {
      return false;
    }
    const lockRel = Number(txInput.lockRel);
    const prevBlockNum = txOutBn.blockNum;
    return this.blockNum >= prevBlockNum + BigInt(lockRel);
  }

  verifyInputs(): boolean {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      if (!this.verifyInputScript(i)) {
        return false;
      }
      if (!this.verifyInputLockRel(i)) {
        return false;
      }
    }
    return true;
  }

  verifyNoDoubleSpend(): boolean {
    const spentOutputs = new Set();
    for (const input of this.tx.inputs) {
      const txOut = this.txOutBnMap.get(input.inputTxId, input.inputTxNOut);
      if (!txOut) {
        return false;
      }
      if (spentOutputs.has(txOut)) {
        return false;
      }
      spentOutputs.add(txOut);
    }
    return true;
  }

  verifyOutputValues(): boolean {
    let totalOutputValue = BigInt(0);
    let totalInputValue = BigInt(0);
    for (const output of this.tx.outputs) {
      totalOutputValue += output.value;
    }
    for (const input of this.tx.inputs) {
      const txOutBn = this.txOutBnMap.get(input.inputTxId, input.inputTxNOut);
      if (!txOutBn) {
        return false;
      }
      totalInputValue += txOutBn.txOut.value;
    }
    return totalOutputValue === totalInputValue;
  }

  verifyIsNotCoinbase(): boolean {
    // TODO: Allow coinbases to have multiple inputs
    if (this.tx.inputs.length === 1 && this.tx.inputs[0].isCoinbase()) {
      return false;
    }
    return true;
  }

  verifyLockAbs(): boolean {
    if (this.tx.lockAbs > this.blockNum) {
      return false;
    }
    return true;
  }

  verify(): boolean {
    if (!this.verifyLockAbs()) {
      return false;
    }
    if (!this.verifyIsNotCoinbase()) {
      return false;
    }
    if (!this.verifyNoDoubleSpend()) {
      return false;
    }
    if (!this.verifyInputs()) {
      return false;
    }
    if (!this.verifyOutputValues()) {
      return false;
    }
    return true;
  }
}
