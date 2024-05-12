import Block from "./block";
import Header from "./header";
import Tx from "./tx";
import MerkleTxs from "./merkle-txs";
import Script from "./script";
import TxIn from "./tx-in";
import TxOut from "./tx-out";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";

export default class BlockBuilder {
  public header: Header;
  public txs: Tx[];
  public merkleTxs: MerkleTxs;

  constructor(header: Header, txs: Tx[], merkleTxs: MerkleTxs) {
    this.header = header;
    this.txs = txs;
    this.merkleTxs = merkleTxs;
  }

  static fromBlock(block: Block): BlockBuilder {
    const header = block.header;
    const txs = block.txs;
    const merkleTxs = new MerkleTxs(txs);
    return new BlockBuilder(header, txs, merkleTxs);
  }

  static fromGenesis(
    initialTarget: Buffer,
    outputScript: Script,
    outputAmount: bigint,
  ): BlockBuilder {
    const header = Header.fromGenesis(initialTarget);
    const txs = [];
    const txInput = TxIn.fromCoinbase(outputScript);
    const txOutput = new TxOut(outputAmount, outputScript);
    const coinbaseTx = new Tx(1, [txInput], [txOutput], 0n);
    txs.push(coinbaseTx);
    const merkleTxs = new MerkleTxs(txs);
    const root = merkleTxs.root;
    header.merkleRoot = root;
    return new BlockBuilder(header, txs, merkleTxs);
  }

  static fromPrevBlockHeader(
    prevBlockHeader: Header,
    prevAdjustmentBlockHeader: Header | null, // exactly 2016 blocks before
    outputScript: Script,
    outputAmount: bigint,
  ): Result<BlockBuilder, string> {
    const res = Header.fromPrevBlockHeader(
      prevBlockHeader,
      prevAdjustmentBlockHeader,
    ).mapErr((err) => `Error creating block builder: ${err}`);
    if (res.err) {
      return res;
    }
    const header = res.unwrap();
    const txs = [];
    const txInput = TxIn.fromCoinbase(outputScript);
    const txOutput = new TxOut(outputAmount, outputScript);
    const coinbaseTx = new Tx(1, [txInput], [txOutput], 0n);
    txs.push(coinbaseTx);
    const merkleTxs = new MerkleTxs(txs);
    const root = merkleTxs.root;
    header.merkleRoot = root;
    return new Ok(new BlockBuilder(header, txs, merkleTxs));
  }

  toBlock(): Block {
    return new Block(this.header, this.txs);
  }

  addTx(tx: Tx): void {
    this.txs.push(tx);
    this.merkleTxs = new MerkleTxs(this.txs);
    this.header.merkleRoot = this.merkleTxs.root;
  }
}
