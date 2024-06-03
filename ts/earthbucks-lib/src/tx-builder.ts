import { Tx } from "./tx.js";
import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import { TxOutBnMap } from "./tx-out-bn-map.js";
import { Script } from "./script.js";
import { SysBuf, FixedBuf } from "./ebx-buf.js";
import { EbxError, GenericError } from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class TxBuilder {
  public inputTxOutBnMap: TxOutBnMap;
  public tx: Tx;
  public changeScript: Script;
  public inputAmount: U64;
  public lockAbs: U64;

  constructor(inputTxOutMap: TxOutBnMap, changeScript: Script, lockAbs: U64) {
    this.tx = new Tx(new U8(1), [], [], new U64(0));
    this.inputTxOutBnMap = inputTxOutMap;
    this.changeScript = changeScript;
    this.inputAmount = new U64(0);
    this.lockAbs = lockAbs;
  }

  addOutput(txOut: TxOut): void {
    this.tx.outputs.push(txOut);
  }

  addInput(txIn: TxIn, amount: U64): void {
    this.tx.inputs.push(txIn);
    this.inputAmount = this.inputAmount.add(amount);
  }

  build(): Tx {
    // "tx fees", also called "change fees", are zero on earthbucks. this
    // simplifies the logic of building a tx. input must be exactly equal to
    // output to be valid. remainder goes to change, which is owned by the user.
    // transaction fees are paid by making a separate transaction to a mine.
    this.tx.lockAbs = this.lockAbs;
    const totalSpendAmount: U64 = this.tx.outputs.reduce(
      (acc, output) => acc.add(output.value),
      new U64(0),
    );
    let changeAmount = new U64(0);
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
      if (inputAmount.bn >= totalSpendAmount.bn) {
        changeAmount = inputAmount.sub(totalSpendAmount);
        break;
      }
      const txId = TxOutBnMap.nameToTxId(txOutId);
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
        throw new GenericError("unsupported script type");
      }

      const txInput = new TxIn(txId, txOutNum, inputScript, new U32(0));
      const outputAmount = txOutBn.txOut.value;
      inputAmount = inputAmount.add(outputAmount);
      this.tx.inputs.push(txInput);
    }
    this.inputAmount = inputAmount;
    if (changeAmount.bn > BigInt(0)) {
      const txOut = new TxOut(changeAmount, this.changeScript);
      this.addOutput(txOut);
    }
    return this.tx;
  }
}
