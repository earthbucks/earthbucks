import { FixedBuf } from "@webbuf/fixedbuf";
import { Tx } from "./tx.js";

export class TxWId {
  public id: FixedBuf<32>;
  public tx: Tx;

  constructor(id: FixedBuf<32>, tx: Tx) {
    this.id = id;
    this.tx = tx;
  }

  static fromTx(tx: Tx): TxWId {
    return new TxWId(tx.id(), tx);
  }
}
