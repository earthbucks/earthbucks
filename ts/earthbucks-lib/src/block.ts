import Header from "./header";
import Tx from "./tx";
import VarInt from "./var-int";
import IsoBufWriter from "./iso-buf-writer";
import IsoBufReader from "./iso-buf-reader";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "ts-results";

export default class Block {
  public header: Header;
  public txs: Tx[];

  constructor(header: Header, txs: Tx[]) {
    this.header = header;
    this.txs = txs;
  }

  static fromIsoBufReader(br: IsoBufReader): Result<Block, string> {
    try {
      const header = Header.fromIsoBufReader(br)
        .mapErr((err) => `Unable to parse header: ${err}`)
        .unwrap();
      const txCountVarInt = VarInt.fromIsoBufReader(br)
        .mapErr((err) => `Unable to parse tx count 1: ${err}`)
        .unwrap();
      const txCount = txCountVarInt
        .toBigInt()
        .mapErr((err) => `Unable to parse tx count 2: ${err}`)
        .unwrap();

      const txs: Tx[] = [];
      for (let i = 0; i < txCount; i++) {
        try {
          const tx = Tx.fromIsoBufReader(br);
          txs.push(tx);
        } catch (err) {
          return Err(`Unable to parse transactions: ${err}`);
        }
      }
      return Ok(new Block(header, txs));
    } catch (err) {
      return Err(err?.toString() || "Unknown error parsing block");
    }
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
