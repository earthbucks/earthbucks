import type { TxOut } from "./tx-out.js";
import type { U32BE } from "@webbuf/numbers";

export class TxOutBn {
  txOut: TxOut;
  blockNum: U32BE;

  constructor(txOut: TxOut, blockNum: U32BE) {
    this.txOut = txOut;
    this.blockNum = blockNum;
  }
}
