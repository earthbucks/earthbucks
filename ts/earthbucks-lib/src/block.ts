import { Header } from "./header.js";
import { Tx } from "./tx.js";
import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import { SysBuf } from "./buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class Block {
  public header: Header;
  public txs: Tx[];

  constructor(header: Header, txs: Tx[]) {
    this.header = header;
    this.txs = txs;
  }

  static fromBufReader(br: BufReader): Block {
    const header = Header.fromBufReader(br);
    const txCount = br.readVarInt().n;

    const txs: Tx[] = [];
    for (let i = 0; i < txCount; i++) {
      const tx = Tx.fromBufReader(br);
      txs.push(tx);
    }

    return new Block(header, txs);
  }

  toBufWriter(bw: BufWriter): BufWriter {
    bw.write(this.header.toBuf());
    bw.writeVarInt(new U64(this.txs.length));
    this.txs.forEach((tx) => {
      bw.write(tx.toBuf());
    });
    return bw;
  }

  toBuf(): SysBuf {
    return this.toBufWriter(new BufWriter()).toBuf();
  }

  static fromBuf(buf: SysBuf): Block {
    return Block.fromBufReader(new BufReader(buf));
  }

  isGenesis(): boolean {
    return this.header.isGenesis() && this.txs.length === 1;
  }
}
