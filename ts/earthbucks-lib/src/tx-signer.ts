import Tx from './tx'
import Key from './key'
import PubKeyHash from './pub-key-hash'
import PubKeyHashKeyMap from './pub-key-hash-key-map'
import TxOutputMap from './tx-output-map'
import TxSignature from './tx-signature'

export default class TxSigner {
  public tx: Tx
  public pubKeyHashKeyMap: PubKeyHashKeyMap
  public txOutMap: TxOutputMap

  constructor(
    tx: Tx,
    txOutMap: TxOutputMap,
    pubKeyHashKeyMap: PubKeyHashKeyMap,
  ) {
    this.tx = tx
    this.txOutMap = txOutMap
    this.pubKeyHashKeyMap = pubKeyHashKeyMap
  }

  sign(nIn: number): boolean {
    const txInput = this.tx.inputs[nIn]
    const txOutHash = txInput.inputTxId
    const outputIndex = txInput.inputTxIndex
    const txOut = this.txOutMap.get(txOutHash, outputIndex)
    if (!txOut) {
      return false
    }
    if (!txOut.script.isPubKeyHashOutput()) {
      return false
    }
    const pubKeyHash = txOut.script.chunks[2].buffer as Uint8Array
    const inputScript = txInput.script
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
    const sig = this.tx.sign(
      nIn,
      key.privateKey,
      outputScriptBuf,
      outputAmount,
      TxSignature.SIGHASH_ALL,
    )
    const sigBuf = sig.toU8Vec()
    if (sigBuf.length !== 65) {
      return false
    }
    inputScript.chunks[0].buffer = Buffer.from(sigBuf)
    txInput.script = inputScript
    return true
  }

  signAll(): boolean {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      if (!this.sign(i)) {
        return false
      }
    }
    return true
  }
}
