import { Header } from "./header.js";
import { Tx } from "./tx.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { SysBuf } from "./iso-buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class Block {
  public header: Header;
  public txs: Tx[];

  constructor(header: Header, txs: Tx[]) {
    this.header = header;
    this.txs = txs;
  }

  static fromIsoBufReader(br: IsoBufReader): Block {
    const header = Header.fromIsoBufReader(br);
    const txCount = br.readVarInt().n;

    const txs: Tx[] = [];
    for (let i = 0; i < txCount; i++) {
      const tx = Tx.fromIsoBufReader(br);
      txs.push(tx);
    }

    return new Block(header, txs);
  }

  toIsoBufWriter(bw: IsoBufWriter): IsoBufWriter {
    bw.write(this.header.toIsoBuf());
    bw.writeVarInt(new U64(this.txs.length));
    this.txs.forEach((tx) => {
      bw.write(tx.toIsoBuf());
    });
    return bw;
  }

  toIsoBuf(): SysBuf {
    return this.toIsoBufWriter(new IsoBufWriter()).toIsoBuf();
  }

  static fromIsoBuf(buf: SysBuf): Block {
    return Block.fromIsoBufReader(new IsoBufReader(buf));
  }

  isGenesis(): boolean {
    return this.header.isGenesis() && this.txs.length === 1;
  }
}
