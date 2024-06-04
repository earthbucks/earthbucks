import { Block } from "./block.js";
import { Header } from "./header.js";
import { Tx } from "./tx.js";
import { MerkleTxs } from "./merkle-txs.js";
import { Script } from "./script.js";
import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import { SysBuf, FixedBuf } from "./ebx-buf.js";
import { U8, U16, U32, U64, U128, U256 } from "./numbers.js";

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
    initialTarget: U256,
    outputScript: Script,
    outputAmount: U64,
  ): BlockBuilder {
    const header = Header.fromGenesis(initialTarget);
    const txs = [];
    const txInput = TxIn.fromCoinbase(outputScript);
    const txOutput = new TxOut(outputAmount, outputScript);
    const coinbaseTx = new Tx(new U8(0), [txInput], [txOutput], new U64(0n));
    txs.push(coinbaseTx);
    const merkleTxs = new MerkleTxs(txs);
    const root = merkleTxs.root;
    header.merkleRoot = root;
    return new BlockBuilder(header, txs, merkleTxs);
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
