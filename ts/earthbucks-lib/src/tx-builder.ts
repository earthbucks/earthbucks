import Tx from "./tx";
import TxIn from "./tx-in";
import TxOut from "./tx-out";
import TxOutMap from "./tx-out-map";
import Script from "./script";
import { Buffer } from "buffer";

export default class TxBuilder {
  public inputTxOutMap: TxOutMap;
  public tx: Tx;
  public changeScript: Script;
  public inputAmount: bigint;
  public lockAbs: bigint;
  public workingBlockNum: bigint;

  constructor(
    inputTxOutMap: TxOutMap,
    changeScript: Script,
    lockAbs: bigint,
    workingBlockNum: bigint,
  ) {
    this.tx = new Tx(1, [], [], BigInt(0));
    this.inputTxOutMap = inputTxOutMap;
    this.changeScript = changeScript;
    this.inputAmount = BigInt(0);
    this.lockAbs = lockAbs;
    this.workingBlockNum = workingBlockNum;
  }

  addOutput(txOut: TxOut): void {
    this.tx.outputs.push(txOut);
  }

  build(): Tx {
    // "tx fees", also called "change fees", are zero on earthbucks. this
    // simplifies the logic of building a tx. input must be exactly equal to
    // output to be valid. remainder goes to change, which is owned by the user.
    // transaction fees are paid by making a separate transaction to a mine.
    this.tx.inputs = [];
    const totalSpendAmount = this.tx.outputs.reduce(
      (acc, output) => acc + output.value,
      BigInt(0),
    );
    let changeAmount = BigInt(0);
    let inputAmount = BigInt(0);
    for (const [txOutId, txOut] of this.inputTxOutMap.map) {
      const isAddressOutput = txOut.script.isPkhOutput();
      if (!isAddressOutput) {
        continue;
      }
      const txIdHash = TxOutMap.nameToTxIdHash(txOutId);
      const outputIndex = TxOutMap.nameToOutputIndex(txOutId);
      const inputScript = Script.fromPkhInputPlaceholder();
      const txInput = new TxIn(txIdHash, outputIndex, inputScript, 0xffffffff);
      const outputAmount = txOut.value;
      inputAmount += outputAmount;
      this.tx.inputs.push(txInput);
      if (inputAmount >= totalSpendAmount) {
        changeAmount = inputAmount - totalSpendAmount;
        break;
      }
    }
    this.inputAmount = inputAmount;
    if (changeAmount > BigInt(0)) {
      const txOut = new TxOut(changeAmount, this.changeScript);
      this.addOutput(txOut);
    }
    return this.tx;
  }
}
