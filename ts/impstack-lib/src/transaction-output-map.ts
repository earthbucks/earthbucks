import TransactionOutput from './transaction-output'

export default class TransactionOutputMap {
  public map: Map<string, TransactionOutput>

  constructor() {
    this.map = new Map<string, TransactionOutput>()
  }

  static nameFromOutput(txIdHash: Uint8Array, outputIndex: number): string {
    const txIdStr = Buffer.from(txIdHash).toString('hex')
    const outputIndexStr = String(outputIndex)
    return `${txIdStr}:${outputIndexStr}`
  }

  add(
    output: TransactionOutput,
    txIdHash: Uint8Array,
    outputIndex: number,
  ): void {
    const name = TransactionOutputMap.nameFromOutput(txIdHash, outputIndex)
    this.map.set(name, output)
  }

  remove(txIdHash: Uint8Array, outputIndex: number): void {
    const name = TransactionOutputMap.nameFromOutput(txIdHash, outputIndex)
    this.map.delete(name)
  }

  get(
    txIdHash: Uint8Array,
    outputIndex: number,
  ): TransactionOutput | undefined {
    const name = TransactionOutputMap.nameFromOutput(txIdHash, outputIndex)
    return this.map.get(name)
  }

  values(): IterableIterator<TransactionOutput> {
    return this.map.values()
  }
}
