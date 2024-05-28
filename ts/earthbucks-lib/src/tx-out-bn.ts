import { TxOut } from "./tx-out.ts";

export class TxOutBn {
  txOut: TxOut;
  blockNum: bigint;

  constructor(txOut: TxOut, blockNum: bigint) {
    this.txOut = txOut;
    this.blockNum = blockNum;
  }
}
