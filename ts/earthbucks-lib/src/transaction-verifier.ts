import Transaction from './transaction'
import TransactionOutputMap from './transaction-output-map'
import ScriptInterpreter from './script-interpreter'

export default class TransactionVerifier {
  public transaction: Transaction
  public txOutMap: TransactionOutputMap

  constructor(transaction: Transaction, txOutMap: TransactionOutputMap) {
    this.transaction = transaction
    this.txOutMap = txOutMap
  }

  verifyInput(nIn: number): boolean {
    const transactionInput = this.transaction.inputs[nIn]
    const txOutHash = transactionInput.inputTxId
    const outputIndex = transactionInput.inputTxIndex
    const txOut = this.txOutMap.get(txOutHash, outputIndex)
    if (!txOut) {
      return false
    }
    const outputScript = txOut.script
    const inputScript = transactionInput.script
    if (!inputScript.isPushOnly()) {
      return false
    }
    const stack = inputScript.chunks.map(
      (chunk) => new Uint8Array(chunk.buffer || Buffer.from('')),
    )
    const scriptInterpreter = ScriptInterpreter.fromOutputScriptTransaction(
      outputScript,
      this.transaction,
      nIn,
      stack,
      txOut.value,
    )
    const result = scriptInterpreter.evalScript()
    return result
  }

  verify(): boolean {
    for (let i = 0; i < this.transaction.inputs.length; i++) {
      if (!this.verifyInput(i)) {
        return false
      }
    }
    return true
  }
}
