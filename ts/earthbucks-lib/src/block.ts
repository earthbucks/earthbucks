import { Header } from "./header.js";
import { Tx } from "./tx.js";
import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import { SysBuf } from "./ebx-buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class Block {
  public header: Header;
  public txs: Tx[];

  constructor(header: Header, txs: Tx[]) {
    this.header = header;
    this.txs = txs;
  }

  static fromEbxBufReader(br: BufReader): Block {
    const header = Header.fromEbxBufReader(br);
    const txCount = br.readVarInt().n;

    const txs: Tx[] = [];
    for (let i = 0; i < txCount; i++) {
      const tx = Tx.fromEbxBufReader(br);
      txs.push(tx);
    }

    return new Block(header, txs);
  }

  toEbxBufWriter(bw: BufWriter): BufWriter {
    bw.write(this.header.toEbxBuf());
    bw.writeVarInt(new U64(this.txs.length));
    this.txs.forEach((tx) => {
      bw.write(tx.toEbxBuf());
    });
    return bw;
  }

  toEbxBuf(): SysBuf {
    return this.toEbxBufWriter(new BufWriter()).toSysBuf();
  }

  static fromEbxBuf(buf: SysBuf): Block {
    return Block.fromEbxBufReader(new BufReader(buf));
  }

  isGenesis(): boolean {
    return this.header.isGenesis() && this.txs.length === 1;
  }
}
