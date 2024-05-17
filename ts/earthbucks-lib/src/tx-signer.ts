import Tx from "./tx";
import PkhKeyMap from "./pkh-key-map";
import TxOutBnMap from "./tx-out-bn-map";
import TxSignature from "./tx-signature";
import { Buffer } from "buffer";
import PubKey from "./pub-key";
import { Result, Ok, Err } from "./ts-results/result";

export default class TxSigner {
  public tx: Tx;
  public pkhKeyMap: PkhKeyMap;
  public txOutMap: TxOutBnMap;

  constructor(tx: Tx, txOutMap: TxOutBnMap, pkhKeyMap: PkhKeyMap) {
    this.tx = tx;
    this.txOutMap = txOutMap;
    this.pkhKeyMap = pkhKeyMap;
  }

  sign(nIn: number): Result<Tx, string> {
    const txInput = this.tx.inputs[nIn];
    const txOutHash = txInput.inputTxId;
    const outputIndex = txInput.inputTxNOut;
    const txOutBn = this.txOutMap.get(txOutHash, outputIndex);
    if (!txOutBn) {
      return new Err("tx_out not found");
    }

    if (txOutBn.txOut.script.isPkhOutput()) {
      const pkh_buf = txOutBn.txOut.script.chunks[2].buf as Buffer;
      const inputScript = txInput.script;
      if (!inputScript.isPkhInput()) {
        return new Err("expected pkh input placeholder");
      }
      const key = this.pkhKeyMap.get(pkh_buf);
      if (!key) {
        return new Err("key not found");
      }
      const pubKey = key.pubKey.toIsoBuf();
      inputScript.chunks[1].buf = Buffer.from(pubKey);
      const outputScriptBuf = txOutBn.txOut.script.toIsoBuf();
      const outputAmount = txOutBn.txOut.value;
      const sig = this.tx.signNoCache(
        nIn,
        key.privKey.toIsoBuf(),
        outputScriptBuf,
        outputAmount,
        TxSignature.SIGHASH_ALL,
      );
      const sigBuf = sig.toIsoBuf();
      inputScript.chunks[0].buf = Buffer.from(sigBuf);
    } else {
      return new Err("unsupported script type");
    }

    return new Ok(this.tx);
  }

  signAll(): Result<Tx, string> {
    for (let i = 0; i < this.tx.inputs.length; i++) {
      let res = this.sign(i);
      if (res.err) {
        return new Err("sign_all: " + res.err);
      }
    }
    return new Ok(this.tx);
  }
}
