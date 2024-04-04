import Transaction from './transaction'
import Key from './key'
import PubKeyHash from './pub-key-hash'
import PubKeyHashKeyMap from './pub-key-hash-key-map'
import TransactionOutputMap from './transaction-output-map'
import TransactionSignature from './transaction-signature'

export default class TransactionSigner {
  public transaction: Transaction
  public pubKeyHashKeyMap: PubKeyHashKeyMap
  public txOutMap: TransactionOutputMap

  constructor(
    transaction: Transaction,
    txOutMap: TransactionOutputMap,
    pubKeyHashKeyMap: PubKeyHashKeyMap,
  ) {
    this.transaction = transaction
    this.txOutMap = txOutMap
    this.pubKeyHashKeyMap = pubKeyHashKeyMap
  }

  sign(nIn: number): boolean {
    const transactionInput = this.transaction.inputs[nIn]
    const txOutHash = transactionInput.inputTxId
    const outputIndex = transactionInput.inputTxIndex
    const txOut = this.txOutMap.get(txOutHash, outputIndex)
    if (!txOut) {
      return false
    }
    if (!txOut.script.isPubKeyHashOutput()) {
      return false
    }
    const pubKeyHash = txOut.script.chunks[2].buffer as Uint8Array
    const inputScript = transactionInput.script
    if (!inputScript.isPubKeyHashInput()) {
      return false
    }
    const key = this.pubKeyHashKeyMap.get(pubKeyHash)
    if (!key) {
      return false
    }
    const pubKey = key.publicKey
    if (pubKey.length !== 33) {
      return false
    }
    inputScript.chunks[1].buffer = Buffer.from(pubKey)
    const outputScriptBuf = txOut.script.toU8Vec()
    const outputAmount = txOut.value
    const sig = this.transaction.sign(
      nIn,
      key.privateKey,
      outputScriptBuf,
      outputAmount,
      TransactionSignature.SIGHASH_ALL,
    )
    const sigBuf = sig.toU8Vec()
    if (sigBuf.length !== 65) {
      return false
    }
    inputScript.chunks[0].buffer = Buffer.from(sigBuf)
    transactionInput.script = inputScript
    return true
  }

  signAll(): boolean {
    for (let i = 0; i < this.transaction.inputs.length; i++) {
      if (!this.sign(i)) {
        return false
      }
    }
    return true
  }
}
