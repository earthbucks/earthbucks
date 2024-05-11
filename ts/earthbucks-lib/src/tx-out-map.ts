import TxOut from "./tx-out";
import { Buffer } from "buffer";

export default class TxOutMap {
  public map: Map<string, TxOut>;

  constructor() {
    this.map = new Map<string, TxOut>();
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

  add(output: TxOut, txIdHash: Buffer, outputIndex: number): void {
    const name = TxOutMap.nameFromOutput(txIdHash, outputIndex);
    this.map.set(name, output);
  }

  remove(txIdHash: Buffer, outputIndex: number): void {
    const name = TxOutMap.nameFromOutput(txIdHash, outputIndex);
    this.map.delete(name);
  }

  get(txIdHash: Buffer, outputIndex: number): TxOut | undefined {
    const name = TxOutMap.nameFromOutput(txIdHash, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOut> {
    return this.map.values();
  }
}
