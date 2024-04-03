import Transaction from './transaction'
import TransactionInput from './transaction-input'
import TransactionOutput from './transaction-output'
import TransactionOutputMap from './transaction-output-map'
import Script from './script'

export default class TransactionBuilder {
  public txOutMap: TransactionOutputMap
  public transaction: Transaction
  public changeScript: Script
  public inputAmount: bigint

  constructor(txOutMap: TransactionOutputMap, changeScript: Script) {
    this.transaction = new Transaction(1, [], [], BigInt(0))
    this.txOutMap = txOutMap
    this.changeScript = changeScript
    this.inputAmount = BigInt(0)
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
    // assume zero fees and send 100% of remainder to change. we need to
    // compute the total spend amount, and then loop through every txOut,
    // and add the txOut to the inputs, until we have enough to cover the
    // total spend amount. then we add the change output. note that this
    // function can produce transactions with insufficient inputs, and
    // therefore invalid transactions. you must input enough to cover the
    // total spend amount or the output will be invalid. note also that this
    // transaction is not signed.
    this.transaction.inputs = []
    const totalSpendAmount = this.transaction.outputs.reduce(
      (acc, output) => acc + output.value,
      BigInt(0),
    )
    let changeAmount = BigInt(0)
    let inputAmount = BigInt(0)
    for (const [txOutId, txOut] of this.txOutMap.map) {
      const isPubKeyHashOutput = txOut.script.isPubKeyHashOutput()
      if (!isPubKeyHashOutput) {
        continue
      }
      const txIdHash = TransactionOutputMap.nameToTxIdHash(txOutId)
      const outputIndex = TransactionOutputMap.nameToOutputIndex(txOutId)
      const inputScript = Script.fromPubKeyHashInputPlaceholder()
      const transactionInput = new TransactionInput(
        txIdHash,
        outputIndex,
        inputScript,
        0xffffffff,
      )
      const outputAmount = txOut.value
      inputAmount += outputAmount
      this.transaction.inputs.push(transactionInput)
      if (inputAmount >= totalSpendAmount) {
        changeAmount = inputAmount - totalSpendAmount
        break
      }
    }
    this.inputAmount = inputAmount
    if (changeAmount > BigInt(0)) {
      this.addOutput(changeAmount, this.changeScript)
    }
    return this.transaction
  }
}
