import Transaction from './transaction'
import TransactionInput from './transaction-input'
import TransactionOutput from './transaction-output'
import TransactionOutputMap from './transaction-output-map'
import Script from './script'

export default class TransactionBuilder {
  public txOutMap: TransactionOutputMap
  public transaction: Transaction
  public changeScript: Script

  constructor(txOutMap: TransactionOutputMap, changeScript: Script) {
    this.transaction = new Transaction(1, [], [], BigInt(0))
    this.txOutMap = txOutMap
    this.changeScript = changeScript
  }

  addInput(
    prevTxId: Uint8Array,
    prevOutputIndex: number,
    script: Script,
    sequence: number,
  ): void {
    const transactionInput = new TransactionInput(
      prevTxId,
      prevOutputIndex,
      script,
      sequence,
    )
    this.transaction.inputs.push(transactionInput)
  }

  addOutput(value: bigint, script: Script): void {
    const transactionOutput = new TransactionOutput(value, script)
    this.txOutMap.add(
      transactionOutput,
      this.transaction.id(),
      this.transaction.outputs.length,
    )
    this.transaction.outputs.push(transactionOutput)
  }

  build(): Transaction {
    const transaction = new Transaction(
      this.transaction.version,
      this.transaction.inputs,
      this.transaction.outputs,
      this.transaction.locktime,
    )
    return transaction
  }
}
