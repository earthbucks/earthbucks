import { U64 } from "./numbers.js";

export class EbxValue {
  public value: U64;

  /**
   * The "value" or of a transaction is measured in "adams".
   * 1 EBX = 10^11 adams
   */
  constructor(value: U64) {
    this.value = value;
  }

  toEBXRaw(): number {
    return this.value.n / 10 ** 11;
  }

  toEBX(decimals = 2): number {
    const ebxValue = this.toEBXRaw();
    if (decimals === undefined) {
      return ebxValue;
    }
    return Math.round(ebxValue * 10 ** decimals) / 10 ** decimals;
  }
}
