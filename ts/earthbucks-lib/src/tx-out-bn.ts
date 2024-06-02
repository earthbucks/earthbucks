import { TxOut } from "./tx-out.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class TxOutBn {
  txOut: TxOut;
  blockNum: U64;

  constructor(txOut: TxOut, blockNum: U64) {
    this.txOut = txOut;
    this.blockNum = blockNum;
  }
}
