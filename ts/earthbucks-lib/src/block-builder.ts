import { Block } from "./block.js";
import { Header } from "./header.js";
import { Tx } from "./tx.js";
import type { Script } from "./script.js";
import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import type { FixedBuf } from "@webbuf/fixedbuf";
import { U8 } from "@webbuf/numbers";
import type { U16BE, U128BE, U256BE } from "@webbuf/numbers";
import { U32BE } from "@webbuf/numbers";
import type { U64BE } from "@webbuf/numbers";
import { MerkleTree } from "./merkle-tree.js";

export class BlockBuilder {
  public header: Header;
  public txs: Tx[];
  public rootMerkleTree: MerkleTree;

  constructor(header: Header, txs: Tx[], rootMerkleTree: MerkleTree) {
    this.header = header;
    this.txs = txs;
    this.rootMerkleTree = rootMerkleTree;
  }

  static fromBlock(block: Block): BlockBuilder {
    const header = block.header;
    const txs = block.txs;
    const merkleRoot = MerkleTree.fromLeafHashes(txs.map((tx) => tx.id()));
    return new BlockBuilder(header, txs, merkleRoot);
  }

  static fromGenesis(
    initialTarget: U256BE,
    outputScript: Script,
    outputAmount: U64BE,
  ): BlockBuilder {
    const txInput = TxIn.fromMintTxScript(outputScript);
    const txOutput = new TxOut(outputAmount, outputScript);
    const mintTx = new Tx(new U8(0), [txInput], [txOutput], new U32BE(0n));
    const txs = [mintTx];
    const merkleRoot = MerkleTree.fromLeafHashes(txs.map((tx) => tx.id()));
    const merkleRootId: FixedBuf<32> = merkleRoot.hash as FixedBuf<32>;
    const header = Header.fromGenesis(merkleRootId, initialTarget);
    return new BlockBuilder(header, txs, merkleRoot);
  }

  toBlock(): Block {
    return new Block(this.header, this.txs);
  }

  addTx(tx: Tx): BlockBuilder {
    const txs = [...this.txs, tx];
    const merkleRoot = this.rootMerkleTree.addLeafHash(tx.id());
    const merkleRootId = merkleRoot.hash as FixedBuf<32>;
    const header = this.header.addTx(merkleRootId);
    return new BlockBuilder(header, txs, merkleRoot);
  }
}
