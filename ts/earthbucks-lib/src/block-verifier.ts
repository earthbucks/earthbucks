import type { Block } from "./block.js";
import { Header } from "./header.js";
import type { Tx } from "./tx.js";
import { MerkleTxs } from "./merkle-txs.js";
import { MerkleNode } from "./merkle-node.js";
import type { TxOutBnMap } from "./tx-out-bn-map.js";
import type { HeaderChain } from "./header-chain.js";
import { U32, U64 } from "./numbers.js";
import type { ScriptChunk } from "./script-chunk.js";
import { Domain } from "./domain.js";
import { TxVerifier } from "./tx-verifier.js";
import { Err, Result } from "./result.js";

export class BlockVerifier {
  public block: Block;
  public rootMerkleNode: MerkleNode;
  public txOutBnMap: TxOutBnMap;
  public prevLch: HeaderChain; // longest chain header up to but not including this block

  constructor(
    block: Block,
    rootMerkleNode: MerkleNode,
    txOutBnMap: TxOutBnMap,
    prevLch: HeaderChain,
  ) {
    this.block = block;
    this.rootMerkleNode = rootMerkleNode;
    this.txOutBnMap = txOutBnMap;
    this.prevLch = prevLch;
  }

  static fromBlock(
    block: Block,
    txOutBnMap: TxOutBnMap,
    lch: HeaderChain,
  ): BlockVerifier {
    const txs = block.txs;
    const rootMerkleNode = MerkleNode.fromLeafHashes(txs.map((tx) => tx.id()));
    return new BlockVerifier(block, rootMerkleNode, txOutBnMap, lch);
  }

  verifyMerkleRoot(): void {
    const merkleTxs = MerkleTxs.fromTxs(this.block.txs);
    if (!this.block.header.rootMerkleNodeId.buf.equals(merkleTxs.root.buf)) {
      throw new Error("Invalid merkle root");
    }
  }

  isValidMerkleRoot(): boolean {
    try {
      this.verifyMerkleRoot();
      return true;
    } catch (e) {
      return false;
    }
  }

  resIsValidHeaderAt(actualNTransactions: U64, timestamp: U64): Result<true> {
    const prevHeader = this.prevLch.getTip();
    if (!prevHeader) {
      return Err("No previous header");
    }
    const prevPrevHeader =
      this.prevLch.headers[this.prevLch.headers.length - 2] || null;
    return this.block.header.resIsValidAt(
      prevHeader,
      prevPrevHeader,
      actualNTransactions,
      timestamp,
    );
  }

  hasValidMintTx(): Result<boolean> {
    const header = this.block.header;
    const mintTx = this.block.txs[this.block.txs.length - 1];
    if (!mintTx) {
      return Err("No mint tx");
    }
    return header.resHasValidMintTx(mintTx);
  }

  isValidTxs(): boolean {
    const txOutBnMap = this.txOutBnMap.shallowClone();
    if (!this.hasValidMintTx()) {
      return false;
    }
    const txs = this.block.txs.slice(0, -1);
    // - iterate through all transactions except the last (mint tx)
    // - verify with verifier
    // - if invalid, return false
    // - if valid, add outputs to tx_output_map and remove used outputs to
    //   prevent double spending
    for (const tx of txs) {
      const txVerifier = new TxVerifier(
        tx,
        txOutBnMap,
        this.block.header.blockNum,
      );
      if (!txVerifier.verify()) {
        return false;
      }
      txOutBnMap.addTxOutputs(tx, this.block.header.blockNum);
      for (const txIn of tx.inputs) {
        txOutBnMap.remove(txIn.inputTxId, txIn.inputTxNOut);
      }
    }
    return true;
  }

  isValidAt(actualNTransactions: U64, timestamp: U64): boolean {
    if (timestamp.bn < this.block.header.timestamp.bn) {
      return false;
    }
    if (!this.resIsValidHeaderAt(actualNTransactions, timestamp).result) {
      return false;
    }
    if (!this.isValidMerkleRoot()) {
      return false;
    }
    if (!this.isValidTxs()) {
      return false;
    }
    return true;
  }

  isValidNow(actualNTransactions: U64): boolean {
    const timestamp = Header.getNewTimestamp();
    return this.isValidAt(actualNTransactions, timestamp);
  }
}
