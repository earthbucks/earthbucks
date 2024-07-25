import { HashCache } from "./tx.js";
import type { Tx } from "./tx.js";
import type { TxOutBnMap } from "./tx-out-bn-map.js";
import { ScriptInterpreter } from "./script-interpreter.js";
import { SysBuf } from "./buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import type { TxIn } from "./tx-in.js";

export class TxVerifier {
  public tx: Tx;
  public txOutBnMap: TxOutBnMap;
  public hashCache: HashCache;
  public blockNum: U32;

  constructor(tx: Tx, txOutBnMap: TxOutBnMap, blockNum: U32) {
    this.tx = tx;
    this.txOutBnMap = txOutBnMap;
    this.hashCache = new HashCache();
    this.blockNum = blockNum;
  }

  verifyInputScript(nIn: U32): boolean {
    const txInput = this.tx.inputs[nIn.n] as TxIn;
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
    return result;
  }

  verifyInputLockRel(nIn: U32): boolean {
    const txInput = this.tx.inputs[nIn.n] as TxIn;
    const txId = txInput.inputTxId;
    const txOutNum = txInput.inputTxNOut;
    const txOutBn = this.txOutBnMap.get(txId, txOutNum);
    if (!txOutBn) {
      return false;
    }
    const lockRel = txInput.lockRel;
    const prevBlockNum = txOutBn.blockNum;
    return this.blockNum.bn >= prevBlockNum.bn + lockRel.bn;
  }

  verifyInputs(): boolean {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      if (!this.verifyInputScript(new U32(i))) {
        return false;
      }
      if (!this.verifyInputLockRel(new U32(i))) {
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
    let totalOutputValue = new U64(0);
    let totalInputValue = new U64(0);
    for (const output of this.tx.outputs) {
      totalOutputValue = totalOutputValue.add(output.value);
    }
    for (const input of this.tx.inputs) {
      const txOutBn = this.txOutBnMap.get(input.inputTxId, input.inputTxNOut);
      if (!txOutBn) {
        return false;
      }
      totalInputValue = totalInputValue.add(txOutBn.txOut.value);
    }
    return totalOutputValue.bn === totalInputValue.bn;
  }

  verifyIsNotMintTx(): boolean {
    // TODO: Allow mintTxs to have multiple inputs
    if (this.tx.inputs.length === 1 && this.tx.inputs[0]?.isMintTx()) {
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
    if (!this.verifyIsNotMintTx()) {
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
