import { TxOutBn } from "./tx-out-bn.js";
import { EbxBuf } from "./ebx-buf.js";

export class TxOutBnMap {
  public map: Map<string, TxOutBn>;

  constructor() {
    this.map = new Map<string, TxOutBn>();
  }

  static nameFromOutput(txIdHash: EbxBuf, outputIndex: number): string {
    const txIdStr = EbxBuf.from(txIdHash).toString("hex");
    const outputIndexStr = String(outputIndex);
    return `${txIdStr}:${outputIndexStr}`;
  }

  static nameToTxIdHash(name: string): EbxBuf {
    return EbxBuf.from(name.split(":")[0], "hex");
  }

  static nameToOutputIndex(name: string): number {
    return parseInt(name.split(":")[1]);
  }

  add(txOutBn: TxOutBn, txIdHash: EbxBuf, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txIdHash: EbxBuf, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.delete(name);
  }

  get(txIdHash: EbxBuf, outputIndex: number): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }
}
