import TxOutput from "./tx-output";
import { Buffer } from "buffer";

export default class TxOutputMap {
  public map: Map<string, TxOutput>;

  constructor() {
    this.map = new Map<string, TxOutput>();
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

  add(output: TxOutput, txIdHash: Buffer, outputIndex: number): void {
    const name = TxOutputMap.nameFromOutput(txIdHash, outputIndex);
    this.map.set(name, output);
  }

  remove(txIdHash: Buffer, outputIndex: number): void {
    const name = TxOutputMap.nameFromOutput(txIdHash, outputIndex);
    this.map.delete(name);
  }

  get(txIdHash: Buffer, outputIndex: number): TxOutput | undefined {
    const name = TxOutputMap.nameFromOutput(txIdHash, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutput> {
    return this.map.values();
  }
}
