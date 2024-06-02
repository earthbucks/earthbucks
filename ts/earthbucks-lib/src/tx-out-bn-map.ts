import { TxOutBn } from "./tx-out-bn.js";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class TxOutBnMap {
  public map: Map<string, TxOutBn>;

  constructor() {
    this.map = new Map<string, TxOutBn>();
  }

  static nameFromOutput(txIdHash: SysBuf, outputIndex: U32): string {
    const txIdStr = SysBuf.from(txIdHash).toString("hex");
    // TODO: Should this be a buffer representation of the outputIndex?
    const outputIndexStr = String(outputIndex.n);
    return `${txIdStr}:${outputIndexStr}`;
  }

  static nameToTxId(name: string): FixedIsoBuf<32> {
    return FixedIsoBuf.fromStrictHex(32, name.split(":")[0]).unwrap();
  }

  static nameToOutputIndex(name: string): U32 {
    // TODO: Should this be a buffer representation of the outputIndex?
    return new U32(parseInt(name.split(":")[1]));
  }

  add(txOutBn: TxOutBn, txId: FixedIsoBuf<32>, outputIndex: U32): void {
    const name = TxOutBnMap.nameFromOutput(txId, outputIndex);
    this.map.set(name, txOutBn);
  }

  remove(txId: FixedIsoBuf<32>, outputIndex: U32): void {
    const name = TxOutBnMap.nameFromOutput(txId, outputIndex);
    this.map.delete(name);
  }

  get(txId: FixedIsoBuf<32>, outputIndex: U32): TxOutBn | undefined {
    const name = TxOutBnMap.nameFromOutput(txId, outputIndex);
    return this.map.get(name);
  }

  values(): IterableIterator<TxOutBn> {
    return this.map.values();
  }
}
