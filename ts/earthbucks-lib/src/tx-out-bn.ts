import type { TxOut } from "./tx-out.js";
import type { U32 } from "./numbers.js";

export class TxOutBn {
  txOut: TxOut;
  blockNum: U32;

  constructor(txOut: TxOut, blockNum: U32) {
    this.txOut = txOut;
    this.blockNum = blockNum;
  }
}
