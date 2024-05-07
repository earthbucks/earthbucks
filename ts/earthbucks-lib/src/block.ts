import Header from "./header";
import Tx from "./tx";
import VarInt from "./var-int";
import IsoBufWriter from "./iso-buf-writer";
import IsoBufReader from "./iso-buf-reader";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

export default class Block {
  public header: Header;
  public txs: Tx[];

  constructor(header: Header, txs: Tx[]) {
    this.header = header;
    this.txs = txs;
  }

  static fromIsoBufReader(br: IsoBufReader): Block {
    const header = Header.fromIsoBuf(
      br.readBuffer(Header.BLOCK_HEADER_SIZE).unwrap(),
    );
    const txCountVarInt = VarInt.fromIsoBufReader(br).unwrap();
    if (!txCountVarInt.isMinimal()) {
      throw new Error("non-minimally encoded varint");
    }
    const txCount = txCountVarInt.toBigInt().unwrap();
    const txs: Tx[] = [];
    for (let i = 0; i < txCount; i++) {
      try {
        const tx = Tx.fromIsoBufReader(br);
        txs.push(tx);
      } catch (e) {
        throw new Error("unable to parse transactions");
      }
    }
    return new Block(header, txs);
  }

  toIsoBufWriter(bw: IsoBufWriter): IsoBufWriter {
    bw.writeBuffer(this.header.toIsoBuf());
    bw.writeVarIntNum(this.txs.length);
    this.txs.forEach((tx) => {
      bw.writeBuffer(tx.toIsoBuf());
    });
    return bw;
  }

  toIsoBuf(): Buffer {
    return this.toIsoBufWriter(new IsoBufWriter()).toIsoBuf();
  }

  static fromU8Vec(buf: Buffer): Block {
    return Block.fromIsoBufReader(new IsoBufReader(buf));
  }

  isGenesis(): boolean {
    return this.header.isGenesis() && this.txs.length === 1;
  }
}
