import { U64BE } from "@webbuf/numbers";

export class EbxValue {
  public value: U64BE;

  /**
   * The "value" or of a transaction is measured in "adams".
   * 1 EBX = 10^11 adams
   */
  constructor(value: U64BE) {
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
