import { TxOutBn } from "./tx-out-bn.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { BufWriter, BufReader } from "@webbuf/rw";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";
import type { Tx } from "./tx.js";
import { TxOut } from "./tx-out.js";

export class TxOutBnMap {
  public map: Map<string, TxOutBn>;

  constructor() {
    this.map = new Map<string, TxOutBn>();
  }

  shallowClone(): TxOutBnMap {
    const newMap = new TxOutBnMap();
    for (const [name, txOutBn] of this.map) {
      newMap.map.set(name, txOutBn);
    }
    return newMap;
  }

  static nameFromOutput(txIdHash: WebBuf, outputIndex: U32BE): string {
    const txIdStr = WebBuf.from(txIdHash).toString("hex");
    const outputIndexStr = outputIndex.toBEBuf().toHex();
    return `${txIdStr}:${outputIndexStr}`;
  }

  static nameToTxId(name: string): FixedBuf<32> {
    return FixedBuf.fromHex(32, name.split(":")[0] as string);
  }

  static nameToOutputIndex(name: string): U32BE {
    const outputIndexHex = name.split(":")[1];
    if (!outputIndexHex) {
      throw new Error("Invalid output index");
    }
    return U32BE.fromBEBuf(FixedBuf.fromHex(4, outputIndexHex));
  }

  add(txOutBn: TxOutBn, txId: FixedBuf<32>, outputIndex: U32BE) {
    const name = TxOutBnMap.nameFromOutput(txId.buf, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txId: FixedBuf<32>, outputIndex: U32BE) {
    const name = TxOutBnMap.nameFromOutput(txId.buf, outputIndex);
    this.map.delete(name);
  }

  get(txId: FixedBuf<32>, outputIndex: U32BE): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txId.buf, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }

  addTxOutputs(tx: Tx, blockNum: U32BE) {
    tx.outputs.forEach((txOut, i) => {
      const txOutBn = new TxOutBn(txOut, blockNum);
      this.add(txOutBn, tx.id(), new U32BE(i));
    });
  }

  toBuf(): WebBuf {
    const writer = new BufWriter();
    for (const [name, txOutBn] of this.map) {
      const txId = TxOutBnMap.nameToTxId(name);
      const outputIndex = TxOutBnMap.nameToOutputIndex(name);
      const txOutBuf = txOutBn.txOut.toBuf();
      const txOutBufLen = new U16BE(txOutBuf.length);
      const blockNumBuf = txOutBn.blockNum.toBEBuf().buf;
      writer.write(txId.buf);
      writer.write(outputIndex.buf.buf);
      writer.write(txOutBufLen.buf.buf);
      writer.write(txOutBuf);
      writer.write(blockNumBuf);
    }
    return writer.toBuf();
  }

  static fromBuf(buf: WebBuf): TxOutBnMap {
    const reader = new BufReader(buf);
    const map = new Map<string, TxOutBn>();
    while (reader.eof() === false) {
      const txId = FixedBuf.fromBuf(32, reader.read(32));
      const outputIndex = U32BE.fromBEBuf(reader.read(4));
      const txOutLen = U16BE.fromBEBuf(reader.read(2));
      const txOut = TxOut.fromBuf(reader.read(txOutLen.n));
      const blockNum = U32BE.fromBEBuf(reader.read(4));
      const txOutBn = new TxOutBn(txOut, blockNum);
      const name = TxOutBnMap.nameFromOutput(txId.buf, outputIndex);
      map.set(name, txOutBn);
    }
    const txOutBnMap = new TxOutBnMap();
    txOutBnMap.map = map;
    return txOutBnMap;
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromHex(hex: string): TxOutBnMap {
    return TxOutBnMap.fromBuf(WebBuf.fromHex(hex));
  }
}
