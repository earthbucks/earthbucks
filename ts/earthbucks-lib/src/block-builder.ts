import { Block } from "./block.js";
import { Header } from "./header.js";
import { Tx } from "./tx.js";
import type { Script } from "./script.js";
import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import type { FixedBuf } from "./buf.js";
import { U8 } from "./numbers.js";
import type { U16, U128, U256 } from "./numbers.js";
import { U32 } from "./numbers.js";
import type { U64 } from "./numbers.js";
import { MerkleNode } from "./merkle-node.js";

export class BlockBuilder {
  public header: Header;
  public txs: Tx[];
  public rootMerkleNode: MerkleNode;

  constructor(header: Header, txs: Tx[], rootMerkleNode: MerkleNode) {
    this.header = header;
    this.txs = txs;
    this.rootMerkleNode = rootMerkleNode;
  }

  static fromBlock(block: Block): BlockBuilder {
    const header = block.header;
    const txs = block.txs;
    const merkleRoot = MerkleNode.fromLeafHashes(txs.map((tx) => tx.id()));
    return new BlockBuilder(header, txs, merkleRoot);
  }

  static fromGenesis(
    initialTarget: U256,
    outputScript: Script,
    outputAmount: U64,
  ): BlockBuilder {
    const txInput = TxIn.fromMintTxScript(outputScript);
    const txOutput = new TxOut(outputAmount, outputScript);
    const mintTx = new Tx(new U8(0), [txInput], [txOutput], new U32(0n));
    const txs = [mintTx];
    const merkleRoot = MerkleNode.fromLeafHashes(txs.map((tx) => tx.id()));
    const merkleRootId: FixedBuf<32> = merkleRoot.hash as FixedBuf<32>;
    const header = Header.fromGenesis(merkleRootId, initialTarget);
    return new BlockBuilder(header, txs, merkleRoot);
  }

  toBlock(): Block {
    return new Block(this.header, this.txs);
  }

  addTx(tx: Tx): BlockBuilder {
    const txs = [...this.txs, tx];
    const merkleRoot = this.rootMerkleNode.addLeafHash(tx.id());
    const merkleRootId = merkleRoot.hash as FixedBuf<32>;
    const header = this.header.addTx(merkleRootId);
    return new BlockBuilder(header, txs, merkleRoot);
  }
}
