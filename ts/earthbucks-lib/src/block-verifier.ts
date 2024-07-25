import type { Block } from "./block.js";
import { Header } from "./header.js";
import type { Tx } from "./tx.js";
import { MerkleTxs } from "./merkle-txs.js";
import { GenericError, VerificationError } from "./error.js";
import { MerkleNode } from "./merkle-node.js";
import type { TxOutBnMap } from "./tx-out-bn-map.js";
import type { HeaderChain } from "./header-chain.js";
import { U64 } from "./numbers.js";
import type { ScriptChunk } from "./script-chunk.js";
import { Domain } from "./domain.js";
import { TxVerifier } from "./tx-verifier.js";

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
      throw new VerificationError("Invalid merkle root");
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

  isValidHeaderAt(timestamp: U64): boolean {
    return this.block.header.isValidAt(this.prevLch.headers, timestamp);
  }

  hasValidMintTx(): boolean {
    // 1. mint tx is the last tx
    const txsCount = this.block.txs.length;
    if (txsCount === 0) {
      return false;
    }
    const mintTx = this.block.txs[txsCount - 1] as Tx;
    if (!mintTx.isMintTx()) {
      return false;
    }
    // 2. lockNum equals block number
    if (mintTx.lockAbs.bn !== this.block.header.blockNum.bn) {
      return false;
    }
    // 3. version is 1
    if (mintTx.version.n !== 1) {
      return false;
    }
    // 4. all outputs are pkh
    for (const txOutput of mintTx.outputs) {
      if (!txOutput.script.isPkhOutput()) {
        return false;
      }
    }
    // 5. output amount is correct
    let totalOutputValue = new U64(0);
    for (const output of mintTx.outputs) {
      totalOutputValue = totalOutputValue.add(output.value);
    }
    const expectedMintAmount = Header.mintTxAmount(this.block.header.blockNum);
    if (totalOutputValue.bn !== expectedMintAmount.bn) {
      return false;
    }
    // 5. mint tx script is valid (push only)
    const mintInput = mintTx.inputs[0];
    if (!mintInput) {
      return false;
    }
    const mintScript = mintInput.script;
    if (!mintScript.isPushOnly()) {
      return false;
    }
    // 6. domain name, top of the stack, is valid
    const scriptChunks = mintScript.chunks;
    if (scriptChunks.length === 0) {
      return false;
    }
    const domainChunk = scriptChunks[scriptChunks.length - 1] as ScriptChunk;
    const domainBuf = domainChunk.buf;
    if (!domainBuf) {
      return false;
    }
    const domainStr = domainBuf.toString();
    if (!Domain.isValidDomain(domainStr)) {
      return false;
    }
    // note that we do not verify whether domain is actually responsive and
    // delivers this block. that would require pinging the domain name,
    // which is done elsewhere.
    return true;
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

  isValidAt(timestamp: U64): boolean {
    if (timestamp.bn < this.block.header.timestamp.bn) {
      return false;
    }
    if (!this.isValidHeaderAt(timestamp)) {
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

  isValidNow(): boolean {
    const timestamp = Header.getNewTimestamp();
    return this.isValidAt(timestamp);
  }
}
