import { TxOutBn } from "./tx-out-bn.js";
import { IsoBuf } from "./iso-buf.js";

export class TxOutBnMap {
  public map: Map<string, TxOutBn>;

  constructor() {
    this.map = new Map<string, TxOutBn>();
  }

  static nameFromOutput(txIdHash: IsoBuf, outputIndex: number): string {
    const txIdStr = IsoBuf.from(txIdHash).toString("hex");
    const outputIndexStr = String(outputIndex);
    return `${txIdStr}:${outputIndexStr}`;
  }

  static nameToTxIdHash(name: string): IsoBuf {
    return IsoBuf.from(name.split(":")[0], "hex");
  }

  static nameToOutputIndex(name: string): number {
    return parseInt(name.split(":")[1]);
  }

  add(txOutBn: TxOutBn, txIdHash: IsoBuf, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txIdHash: IsoBuf, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.delete(name);
  }

  get(txIdHash: IsoBuf, outputIndex: number): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }
}
