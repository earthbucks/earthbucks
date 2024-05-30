import { TxOutBn } from "./tx-out-bn.js";
import { EbxBuffer } from "./ebx-buffer";

export class TxOutBnMap {
  public map: Map<string, TxOutBn>;

  constructor() {
    this.map = new Map<string, TxOutBn>();
  }

  static nameFromOutput(txIdHash: EbxBuffer, outputIndex: number): string {
    const txIdStr = EbxBuffer.from(txIdHash).toString("hex");
    const outputIndexStr = String(outputIndex);
    return `${txIdStr}:${outputIndexStr}`;
  }

  static nameToTxIdHash(name: string): EbxBuffer {
    return EbxBuffer.from(name.split(":")[0], "hex");
  }

  static nameToOutputIndex(name: string): number {
    return parseInt(name.split(":")[1]);
  }

  add(txOutBn: TxOutBn, txIdHash: EbxBuffer, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txIdHash: EbxBuffer, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    this.map.delete(name);
  }

  get(txIdHash: EbxBuffer, outputIndex: number): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txIdHash, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }
}
