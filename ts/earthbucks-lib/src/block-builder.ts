import { Block } from "./block.js";
import { Header } from "./header.js";
import { Tx } from "./tx.js";
import { MerkleTxs } from "./merkle-txs.js";
import { Script } from "./script.js";
import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class BlockBuilder {
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
    initialTarget: FixedIsoBuf<32>,
    outputScript: Script,
    outputAmount: U64,
  ): BlockBuilder {
    const header = Header.fromGenesis(initialTarget);
    const txs = [];
    const txInput = TxIn.fromCoinbase(outputScript);
    const txOutput = new TxOut(outputAmount, outputScript);
    const coinbaseTx = new Tx(new U8(1), [txInput], [txOutput], new U64(0n));
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
    outputAmount: U64,
  ): Result<BlockBuilder, string> {
    const res = Header.fromPrevBlockHeader(
      prevBlockHeader,
      prevAdjustmentBlockHeader,
    ).mapErr((err) => `Error creating block builder: ${err}`);
    if (res.err) {
      return Err(res.val);
    }
    const header = res.unwrap();
    const txs = [];
    const txInput = TxIn.fromCoinbase(outputScript);
    const txOutput = new TxOut(outputAmount, outputScript);
    const coinbaseTx = new Tx(new U8(1), [txInput], [txOutput], new U64(0n));
    txs.push(coinbaseTx);
    const merkleTxs = new MerkleTxs(txs);
    const root = merkleTxs.root;
    header.merkleRoot = root;
    return Ok(new BlockBuilder(header, txs, merkleTxs));
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
