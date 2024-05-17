import Tx, { HashCache } from "./tx";
import TxOutBnMap from "./tx-out-bn-map";
import ScriptInterpreter from "./script-interpreter";
import { Buffer } from "buffer";

export default class TxVerifier {
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
    const stack = inputScript.chunks.map(
      (chunk) => chunk.buf || Buffer.from(""),
    );
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

  verifyScripts(): boolean {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      if (!this.verifyInputScript(i)) {
        return false;
      }
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

  verify(): boolean {
    return this.verifyScripts() && this.verifyOutputValues();
  }
}
