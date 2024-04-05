import Tx, { HashCache } from './tx'
import TxOutputMap from './tx-output-map'
import ScriptInterpreter from './script-interpreter'

export default class TxVerifier {
  public tx: Tx
  public txOutMap: TxOutputMap
  public hashCache: HashCache

  constructor(tx: Tx, txOutMap: TxOutputMap) {
    this.tx = tx
    this.txOutMap = txOutMap
    this.hashCache = new HashCache()
  }

  verifyInput(nIn: number): boolean {
    const txInput = this.tx.inputs[nIn]
    const txOutHash = txInput.inputTxId
    const outputIndex = txInput.inputTxIndex
    const txOut = this.txOutMap.get(txOutHash, outputIndex)
    if (!txOut) {
      return false
    }
    const outputScript = txOut.script
    const inputScript = txInput.script
    if (!inputScript.isPushOnly()) {
      return false
    }
    const stack = inputScript.chunks.map(
      (chunk) => new Uint8Array(chunk.buffer || Buffer.from('')),
    )
    const scriptInterpreter = ScriptInterpreter.fromOutputScriptTx(
      outputScript,
      this.tx,
      nIn,
      stack,
      txOut.value,
      this.hashCache,
    )
    const result = scriptInterpreter.evalScript()
    return result
  }

  verify(): boolean {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      if (!this.verifyInput(i)) {
        return false
      }
    }
    return true
  }
}
