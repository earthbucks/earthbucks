import { TxOutBn } from "./tx-out-bn.js";
import { WebBuf, FixedBuf } from "./buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import type { Tx } from "./tx.js";

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

  static nameFromOutput(txIdHash: WebBuf, outputIndex: U32): string {
    const txIdStr = WebBuf.from(txIdHash).toString("hex");
    const outputIndexStr = outputIndex.toBEBuf().toString("hex");
    return `${txIdStr}:${outputIndexStr}`;
  }

  static nameToTxId(name: string): FixedBuf<32> {
    return FixedBuf.fromHex(32, name.split(":")[0] as string);
  }

  static nameToOutputIndex(name: string): U32 {
    const outputIndexHex = name.split(":")[1];
    if (!outputIndexHex) {
      throw new Error("Invalid output index");
    }
    return U32.fromBEBuf(WebBuf.from(outputIndexHex, "hex"));
  }

  add(txOutBn: TxOutBn, txId: FixedBuf<32>, outputIndex: U32) {
    const name = TxOutBnMap.nameFromOutput(txId.buf, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txId: FixedBuf<32>, outputIndex: U32) {
    const name = TxOutBnMap.nameFromOutput(txId.buf, outputIndex);
    this.map.delete(name);
  }

  get(txId: FixedBuf<32>, outputIndex: U32): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txId.buf, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }

  addTxOutputs(tx: Tx, blockNum: U32) {
    tx.outputs.forEach((txOut, i) => {
      const txOutBn = new TxOutBn(txOut, blockNum);
      this.add(txOutBn, tx.id(), new U32(i));
    });
  }
}
