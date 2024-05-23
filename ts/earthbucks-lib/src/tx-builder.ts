import Tx from "./tx";
import TxIn from "./tx-in";
import TxOut from "./tx-out";
import TxOutBnMap from "./tx-out-bn-map";
import Script from "./script";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "option-result/src/result";
import { Option, Some, None } from "option-result/src/option";
import { EbxError, GenericError } from "./ebx-error";

export default class TxBuilder {
  public inputTxOutBnMap: TxOutBnMap;
  public tx: Tx;
  public changeScript: Script;
  public inputAmount: bigint;
  public lockAbs: bigint;
  public workingBlockNum: bigint;

  constructor(
    inputTxOutMap: TxOutBnMap,
    changeScript: Script,
    lockAbs: bigint,
    workingBlockNum: bigint,
  ) {
    this.tx = new Tx(1, [], [], BigInt(0));
    this.inputTxOutBnMap = inputTxOutMap;
    this.changeScript = changeScript;
    this.inputAmount = BigInt(0);
    this.lockAbs = lockAbs;
    this.workingBlockNum = workingBlockNum;
  }

  addOutput(txOut: TxOut): void {
    this.tx.outputs.push(txOut);
  }

  build(): Result<Tx, EbxError> {
    // "tx fees", also called "change fees", are zero on earthbucks. this
    // simplifies the logic of building a tx. input must be exactly equal to
    // output to be valid. remainder goes to change, which is owned by the user.
    // transaction fees are paid by making a separate transaction to a mine.
    this.tx.lockAbs = this.lockAbs;
    this.tx.inputs = [];
    const totalSpendAmount = this.tx.outputs.reduce(
      (acc, output) => acc + output.value,
      BigInt(0),
    );
    let changeAmount = BigInt(0);
    let inputAmount = BigInt(0);

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
      const prevBlockNum = txOutBn.blockNum;
      const txId = TxOutBnMap.nameToTxIdHash(txOutId);
      const txOutNum = TxOutBnMap.nameToOutputIndex(txOutId);
      const txOut = txOutBn.txOut;

      let inputScript: Script;
      let lockRel: number;
      if (txOut.script.isPkhOutput()) {
        inputScript = Script.fromPkhInputPlaceholder();
        lockRel = 0;
      } else if (txOut.script.isPkhx90dOutput()) {
        const expired = Script.isPkhx90dExpired(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (expired) {
          inputScript = Script.fromExpiredPkhxInput();
          lockRel = Script.PKHX_90D_LOCK_REL;
        } else {
          inputScript = Script.fromUnexpiredPkhxInputPlaceholder();
          lockRel = 0;
        }
      } else if (txOut.script.isPkhx1hOutput()) {
        const expired = Script.isPkhx1hExpired(
          this.workingBlockNum,
          prevBlockNum,
        );
        if (expired) {
          inputScript = Script.fromExpiredPkhxInput();
          lockRel = Script.PKHX_1H_LOCK_REL;
        } else {
          inputScript = Script.fromUnexpiredPkhxInputPlaceholder();
          lockRel = 0;
        }
      } else {
        return Err(new GenericError(None, "unsupported script type"));
      }

      const txInput = new TxIn(txId, txOutNum, inputScript, lockRel);
      const outputAmount = txOutBn.txOut.value;
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
    return Ok(this.tx);
  }
}
