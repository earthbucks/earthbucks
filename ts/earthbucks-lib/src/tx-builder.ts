import Tx from "./tx";
import TxIn from "./tx-in";
import TxOut from "./tx-out";
import TxOutBnMap from "./tx-out-bn-map";
import Script from "./script";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./result";
import { Option, Some, None } from "./option";
import { EbxError, GenericError } from "./ebx-error";

export default class TxBuilder {
  public inputTxOutBnMap: TxOutBnMap;
  public tx: Tx;
  public changeScript: Script;
  public inputAmount: bigint;
  public lockAbs: bigint;

  constructor(
    inputTxOutMap: TxOutBnMap,
    changeScript: Script,
    lockAbs: bigint,
  ) {
    this.tx = new Tx(1, [], [], BigInt(0));
    this.inputTxOutBnMap = inputTxOutMap;
    this.changeScript = changeScript;
    this.inputAmount = BigInt(0);
    this.lockAbs = lockAbs;
  }

  addOutput(txOut: TxOut): void {
    this.tx.outputs.push(txOut);
  }

  addInput(txIn: TxIn, amount: bigint): void {
    this.tx.inputs.push(txIn);
    this.inputAmount += amount;
  }

  build(): Result<Tx, EbxError> {
    // "tx fees", also called "change fees", are zero on earthbucks. this
    // simplifies the logic of building a tx. input must be exactly equal to
    // output to be valid. remainder goes to change, which is owned by the user.
    // transaction fees are paid by making a separate transaction to a mine.
    this.tx.lockAbs = this.lockAbs;
    const totalSpendAmount = this.tx.outputs.reduce(
      (acc, output) => acc + output.value,
      BigInt(0),
    );
    let changeAmount = BigInt(0);
    let inputAmount = this.inputAmount;

    // sort by block number first, but if those are the same, sort by the id
    // of the tx_out, which is tx_id plus tx_out_num together in a string.
    // this logic means we use the "most confirmed" outputs first, which is
    // what we want, and then we have a deterministic way to sort the UTXOs
    // in the same block.
    const sortedTxOutBns = Array.from(this.inputTxOutBnMap.map.entries()).sort(
      ([aId, aBn], [bId, bBn]) => {
        const blockNumCmp =
          aBn.blockNum < bBn.blockNum
            ? -1
            : aBn.blockNum > bBn.blockNum
              ? 1
              : 0;
        if (blockNumCmp !== 0) {
          return blockNumCmp;
        }
        return aId < bId ? -1 : aId > bId ? 1 : 0;
      },
    );

    for (const [txOutId, txOutBn] of sortedTxOutBns) {
      if (inputAmount >= totalSpendAmount) {
        changeAmount = inputAmount - totalSpendAmount;
        break;
      }
      const txId = TxOutBnMap.nameToTxIdHash(txOutId);
      const txOutNum = TxOutBnMap.nameToOutputIndex(txOutId);
      const txOut = txOutBn.txOut;

      let inputScript: Script;
      if (txOut.script.isPkhOutput()) {
        inputScript = Script.fromPkhInputPlaceholder();
      } else if (
        txOut.script.isPkhx90dOutput() ||
        txOut.script.isPkhx1hOutput()
      ) {
        inputScript = Script.fromUnexpiredPkhxInputPlaceholder();
      } else if (
        txOut.script.isPkhxr1h40mOutput() ||
        txOut.script.isPkhxr90d60dOutput()
      ) {
        inputScript = Script.fromUnexpiredPkhxrInputPlaceholder();
      } else {
        return Err(new GenericError(None, "unsupported script type"));
      }

      const txInput = new TxIn(txId, txOutNum, inputScript, 0);
      const outputAmount = txOutBn.txOut.value;
      inputAmount += outputAmount;
      this.tx.inputs.push(txInput);
    }
    this.inputAmount = inputAmount;
    if (changeAmount > BigInt(0)) {
      const txOut = new TxOut(changeAmount, this.changeScript);
      this.addOutput(txOut);
    }
    return Ok(this.tx);
  }
}
