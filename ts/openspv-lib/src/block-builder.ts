import Block from './block'
import BlockHeader from './block-header'
import Tx from './tx'
import MerkleTxs from './merkle-txs'
import Script from './script'
import TxInput from './tx-input'
import TxOutput from './tx-output'

export default class BlockBuilder {
  private header: BlockHeader
  private txs: Tx[]
  private merkleTxs: MerkleTxs

  constructor(header: BlockHeader, txs: Tx[], merkleTxs: MerkleTxs) {
    this.header = header
    this.txs = txs
    this.merkleTxs = merkleTxs
  }

  static fromBlock(block: Block): BlockBuilder {
    const header = block.header
    const txs = block.txs
    const merkleTxs = new MerkleTxs(txs)
    return new BlockBuilder(header, txs, merkleTxs)
  }

  static fromGenesis(
    initialTarget: Uint8Array,
    outputScript: Script,
    outputAmount: bigint,
  ): BlockBuilder {
    const header = BlockHeader.fromGenesis(initialTarget)
    const txs = []
    const txInput = TxInput.fromCoinbase(outputScript)
    const txOutput = new TxOutput(outputAmount, outputScript)
    const coinbaseTx = new Tx(1, [txInput], [txOutput], 0n)
    txs.push(coinbaseTx)
    const merkleTxs = new MerkleTxs(txs)
    const root = merkleTxs.root
    header.merkleRoot = root
    return new BlockBuilder(header, txs, merkleTxs)
  }

  static fromPrevBlock(
    prevBlockId: Uint8Array,
    prevBlockIndex: bigint,
    outputScript: Script,
    outputAmount: bigint,
    target: Uint8Array,
  ): BlockBuilder {
    const nonce = new Uint8Array(32)
    const header = BlockHeader.fromPrevBlockId(
      prevBlockId,
      prevBlockIndex,
      nonce,
      target,
    )
    const txs = []
    const txInput = TxInput.fromCoinbase(outputScript)
    const txOutput = new TxOutput(outputAmount, outputScript)
    const coinbaseTx = new Tx(1, [txInput], [txOutput], 0n)
    txs.push(coinbaseTx)
    const merkleTxs = new MerkleTxs(txs)
    const root = merkleTxs.root
    header.merkleRoot = root
    return new BlockBuilder(header, txs, merkleTxs)
  }

  toBlock(): Block {
    return new Block(this.header, this.txs)
  }

  addTx(tx: Tx): void {
    this.txs.push(tx)
    this.merkleTxs = new MerkleTxs(this.txs)
    this.header.merkleRoot = this.merkleTxs.root
  }
}
