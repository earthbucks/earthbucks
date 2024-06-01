import { TxOutBn } from "./tx-out-bn.js";
import { IsoBuf, FixedIsoBuf } from "./iso-buf.js";

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

  static nameToTxId(name: string): FixedIsoBuf<32> {
    return FixedIsoBuf.fromHex(32, name.split(":")[0]).unwrap();
  }

  static nameToOutputIndex(name: string): number {
    return parseInt(name.split(":")[1]);
  }

  add(txOutBn: TxOutBn, txId: FixedIsoBuf<32>, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txId, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txId: FixedIsoBuf<32>, outputIndex: number): void {
    const name = TxOutBnMap.nameFromOutput(txId, outputIndex);
    this.map.delete(name);
  }

  get(txId: FixedIsoBuf<32>, outputIndex: number): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txId, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }
}
