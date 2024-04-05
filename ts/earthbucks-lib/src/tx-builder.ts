import Tx from './tx'
import TxInput from './tx-input'
import TxOutput from './tx-output'
import TxOutputMap from './tx-output-map'
import Script from './script'

export default class TxBuilder {
  public txOutMap: TxOutputMap
  public tx: Tx
  public changeScript: Script
  public inputAmount: bigint

  constructor(txOutMap: TxOutputMap, changeScript: Script) {
    this.tx = new Tx(1, [], [], BigInt(0))
    this.txOutMap = txOutMap
    this.changeScript = changeScript
    this.inputAmount = BigInt(0)
  }

  addOutput(value: bigint, script: Script): void {
    const txOutput = new TxOutput(value, script)
    this.txOutMap.add(txOutput, this.tx.id(), this.tx.outputs.length)
    this.tx.outputs.push(txOutput)
  }

  build(): Tx {
    // assume zero fees and send 100% of remainder to change. we need to
    // compute the total spend amount, and then loop through every txOut,
    // and add the txOut to the inputs, until we have enough to cover the
    // total spend amount. then we add the change output. note that this
    // function can produce txs with insufficient inputs, and
    // therefore invalid txs. you must input enough to cover the
    // total spend amount or the output will be invalid. note also that this
    // tx is not signed.
    this.tx.inputs = []
    const totalSpendAmount = this.tx.outputs.reduce(
      (acc, output) => acc + output.value,
      BigInt(0),
    )
    let changeAmount = BigInt(0)
    let inputAmount = BigInt(0)
    for (const [txOutId, txOut] of this.txOutMap.map) {
      const isAddressOutput = txOut.script.isAddressOutput()
      if (!isAddressOutput) {
        continue
      }
      const txIdHash = TxOutputMap.nameToTxIdHash(txOutId)
      const outputIndex = TxOutputMap.nameToOutputIndex(txOutId)
      const inputScript = Script.fromAddressInputPlaceholder()
      const txInput = new TxInput(
        txIdHash,
        outputIndex,
        inputScript,
        0xffffffff,
      )
      const outputAmount = txOut.value
      inputAmount += outputAmount
      this.tx.inputs.push(txInput)
      if (inputAmount >= totalSpendAmount) {
        changeAmount = inputAmount - totalSpendAmount
        break
      }
    }
    this.inputAmount = inputAmount
    if (changeAmount > BigInt(0)) {
      this.addOutput(changeAmount, this.changeScript)
    }
    return this.tx
  }
}
