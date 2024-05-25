import Header from "./header";
import Tx from "./tx";
import IsoBufWriter from "./iso-buf-writer";
import IsoBufReader from "./iso-buf-reader";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./opt-res/result";

export default class Block {
  public header: Header;
  public txs: Tx[];

  constructor(header: Header, txs: Tx[]) {
    this.header = header;
    this.txs = txs;
  }

  static fromIsoBufReader(br: IsoBufReader): Result<Block, string> {
    const headerRes = Header.fromIsoBufReader(br).mapErr(
      (err) => `Unable to parse header: ${err}`,
    );
    if (headerRes.err) {
      return headerRes;
    }
    const header = headerRes.unwrap();
    const txCountRes = br
      .readVarInt()
      .mapErr((err) => `Unable to parse tx count: ${err}`);
    if (txCountRes.err) {
      return txCountRes;
    }
    const txCount = txCountRes.unwrap();

    const txs: Tx[] = [];
    for (let i = 0; i < txCount; i++) {
      const txRes = Tx.fromIsoBufReader(br).mapErr(
        (err) => `Unable to parse tx ${i}: ${err}`,
      );
      if (txRes.err) {
        return txRes;
      }
      const tx = txRes.unwrap();
      txs.push(tx);
    }

    return Ok(new Block(header, txs));
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

  static fromIsoBuf(buf: Buffer): Result<Block, string> {
    return Block.fromIsoBufReader(new IsoBufReader(buf));
  }

  isGenesis(): boolean {
    return this.header.isGenesis() && this.txs.length === 1;
  }
}
