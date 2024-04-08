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

  static adjustTarget(targetBuf: Uint8Array, timeDiff: bigint): Uint8Array {
    // timeDiff is in seconds.
    // twoWeeks in in seconds.
    const twoWeeks = 2016n * 600n
    // To prevent extreme difficulty adjustments, if it took less than 1 week or
    // more than 8 weeks, we still consider it as 1 week or 8 weeks
    // respectively.
    if (timeDiff < twoWeeks / 2n) {
      timeDiff = twoWeeks / 2n
    }
    if (timeDiff > twoWeeks * 4n) {
      timeDiff = twoWeeks * 4n
    }
    const timeDiffPerTwoWeeksDividedByTimeDiff = twoWeeks / timeDiff
    const targetNum = BigInt('0x' + Buffer.from(targetBuf).toString('hex'))
    const targetTimesTimeDiffInSecs = targetNum * timeDiff
    const newTargetNum =
      targetTimesTimeDiffInSecs / timeDiffPerTwoWeeksDividedByTimeDiff
    const newTargetBuf = Buffer.from(newTargetNum.toString(32), 'hex')
    return newTargetBuf
  }

  static fromPrevBlockHeader(
    prevBlockHeader: BlockHeader,
    prevAdjustmentBlockHeader: BlockHeader | null, // exactly 2016 blocks before
    outputScript: Script,
    outputAmount: bigint,
  ): BlockBuilder {
    let target = null
    const index = prevBlockHeader.index + 1n
    if (index % 2016n === 0n) {
      if (
        !prevAdjustmentBlockHeader ||
        prevAdjustmentBlockHeader.index + 2016n !== index
      ) {
        throw new Error(
          'must provide previous adjustment block header 2016 blocks before',
        )
      }
      const timeDiff =
        prevBlockHeader.timestamp - prevAdjustmentBlockHeader!.timestamp
      const prevTarget = prevBlockHeader.target
      target = BlockBuilder.adjustTarget(prevTarget, timeDiff)
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
