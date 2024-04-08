import BlockHeader from './block-header'
import Tx from './tx'
import VarInt from './var-int'
import BufferWriter from './buffer-writer'
import BufferReader from './buffer-reader'

export default class Block {
  public header: BlockHeader
  public txs: Tx[]

  constructor(header: BlockHeader, txs: Tx[]) {
    this.header = header
    this.txs = txs
  }

  static fromBufferReader(br: BufferReader): Block {
    const header = BlockHeader.fromU8Vec(br.readU8Vec(80))
    const txCountVarInt = VarInt.fromBufferReader(br)
    if (!txCountVarInt.isMinimal()) {
      throw new Error('non-minimally encoded varint')
    }
    const txCount = txCountVarInt.toBigInt()
    const txs: Tx[] = []
    for (let i = 0; i < txCount; i++) {
      try {
        const tx = Tx.fromBufferReader(br)
        txs.push(tx)
      } catch (e) {
        throw new Error('unable to parse transactions')
      }
    }
    return new Block(header, txs)
  }

  toBufferWriter(bw: BufferWriter): BufferWriter {
    bw.writeU8Vec(this.header.toU8Vec())
    bw.writeVarIntNum(this.txs.length)
    this.txs.forEach((tx) => {
      bw.writeU8Vec(tx.toU8Vec())
    })
    return bw
  }

  toU8Vec(): Uint8Array {
    const bw = new BufferWriter()
    bw.writeU8Vec(this.header.toU8Vec())
    bw.writeVarIntNum(this.txs.length)
    this.txs.forEach((tx) => {
      bw.writeU8Vec(tx.toU8Vec())
    })
    return bw.toU8Vec()
  }

  fromU8Vec(buf: Uint8Array): Block {
    const br = new BufferReader(buf)
    const header = BlockHeader.fromU8Vec(br.readU8Vec(80))
    const txCountVarInt = VarInt.fromBufferReader(br)
    if (!txCountVarInt.isMinimal()) {
      throw new Error('non-minimally encoded varint')
    }
    const txCount = txCountVarInt.toBigInt()
    const txs: Tx[] = []
    for (let i = 0; i < txCount; i++) {
      txs.push(Tx.fromBufferReader(br))
    }
    return new Block(header, txs)
  }
}
