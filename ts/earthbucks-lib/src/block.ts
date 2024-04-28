import Header from "./header";
import Tx from "./tx";
import VarInt from "./var-int";
import BufferWriter from "./buffer-writer";
import BufferReader from "./buffer-reader";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

export default class Block {
  public header: Header;
  public txs: Tx[];

  constructor(header: Header, txs: Tx[]) {
    this.header = header;
    this.txs = txs;
  }

  static fromBufferReader(br: BufferReader): Block {
    const header = Header.fromBuffer(br.readBuffer(80));
    const txCountVarInt = VarInt.fromBufferReader(br);
    if (!txCountVarInt.isMinimal()) {
      throw new Error("non-minimally encoded varint");
    }
    const txCount = txCountVarInt.toBigInt();
    const txs: Tx[] = [];
    for (let i = 0; i < txCount; i++) {
      try {
        const tx = Tx.fromBufferReader(br);
        txs.push(tx);
      } catch (e) {
        throw new Error("unable to parse transactions");
      }
    }
    return new Block(header, txs);
  }

  toBufferWriter(bw: BufferWriter): BufferWriter {
    bw.writeBuffer(this.header.toBuffer());
    bw.writeVarIntNum(this.txs.length);
    this.txs.forEach((tx) => {
      bw.writeBuffer(tx.toBuffer());
    });
    return bw;
  }

  toBuffer(): Buffer {
    return this.toBufferWriter(new BufferWriter()).toBuffer();
  }

  static fromU8Vec(buf: Buffer): Block {
    return Block.fromBufferReader(new BufferReader(buf));
  }

  isGenesis(): boolean {
    return this.header.isGenesis() && this.txs.length === 1;
  }
}
