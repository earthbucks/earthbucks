import Block from './block'
import BlockHeader from './block-header'
import Tx from './tx'
import MerkleTxs from './merkle-txs'
import Script from './script'
import TxInput from './tx-input'
import TxOutput from './tx-output'

export default class BlockBuilder {
  public header: BlockHeader
  public txs: Tx[]
  public merkleTxs: MerkleTxs

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

  static fromPrevBlockHeader(
    prevBlockHeader: BlockHeader,
    prevAdjustmentBlockHeader: BlockHeader | null, // exactly 2016 blocks before
    outputScript: Script,
    outputAmount: bigint,
  ): BlockBuilder {
    let target = null
    const index = prevBlockHeader.index + 1n
    if (index % BlockHeader.BLOCKS_PER_ADJUSTMENT === 0n) {
      if (
        !prevAdjustmentBlockHeader ||
        prevAdjustmentBlockHeader.index + BlockHeader.BLOCKS_PER_ADJUSTMENT !==
          index
      ) {
        throw new Error(
          'must provide previous adjustment block header 2016 blocks before',
        )
      }
      const timeDiff =
        prevBlockHeader.timestamp - prevAdjustmentBlockHeader!.timestamp
      const prevTarget = prevBlockHeader.target
      target = BlockHeader.adjustTarget(prevTarget, timeDiff)
    } else {
      target = prevBlockHeader.target
    }
    const header = BlockHeader.fromPrevBlockHeader(prevBlockHeader, target)
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
