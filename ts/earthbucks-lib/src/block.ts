import Header from "./header";
import Tx from "./tx";
import VarInt from "./var-int";
import IsoBufWriter from "./iso-buf-writer";
import IsoBufReader from "./iso-buf-reader";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
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
    let headerRes = Header.fromIsoBufReader(br);
    if (headerRes.err) {
      return Err(headerRes.val);
    }
    const header = headerRes.val;
    const txCountVarIntRes = VarInt.fromIsoBufReader(br);
    if (txCountVarIntRes.err) {
      return Err(txCountVarIntRes.val);
    }
    const txCountVarInt = txCountVarIntRes.val;
    const txCountRes = txCountVarInt.toBigInt();
    if (txCountRes.err) {
      return Err(txCountRes.val);
    }
    const txCount = txCountRes.val;
    const txs: Tx[] = [];
    for (let i = 0; i < txCount; i++) {
      try {
        const tx = Tx.fromIsoBufReader(br);
        txs.push(tx);
      } catch (e) {
        throw new Error("unable to parse transactions");
      }
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
