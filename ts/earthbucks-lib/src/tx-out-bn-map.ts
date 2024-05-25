import TxOutBn from "./tx-out-bn.js";
import { Buffer } from "buffer";

export default class TxOutBnMap {
  public map: Map<string, TxOutBn>;

  constructor() {
    this.map = new Map<string, TxOutBn>();
  }

  static nameFromOutput(txIdHash: Buffer, outputIndex: number): string {
    const txIdStr = Buffer.from(txIdHash).toString("hex");
    const outputIndexStr = String(outputIndex);
    return `${txIdStr}:${outputIndexStr}`;
  }

  static nameToTxIdHash(name: string): Buffer {
    return Buffer.from(name.split(":")[0], "hex");
  }

  static nameToOutputIndex(name: string): number {
    return parseInt(name.split(":")[1]);
  }

  add(txOutBn: TxOutBn, txIdHash: Buffer, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txIdHash: Buffer, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.delete(name);
  }

  get(txIdHash: Buffer, outputIndex: number): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }
}
