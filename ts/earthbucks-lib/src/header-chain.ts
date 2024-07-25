import { Header } from "./header.js";
import { U32 } from "./numbers.js";
import { U64 } from "./numbers.js";
import type { Pkh } from "./pkh.js";
import { ScriptChunk } from "./script-chunk.js";
import { Script } from "./script.js";
import type { FixedBuf } from "./buf.js";
import { Tx } from "./tx.js";
import { GenericError } from "./error.js";
import type { TxOut } from "./tx-out.js";

export class HeaderChain {
  static LENGTH_TARGET_ADJ_PERIOD = Header.BLOCKS_PER_TARGET_ADJ_PERIOD;
  static LENGTH_EXPIRY_PERIOD = Script.PKHXR_90D_60D_X_LOCK_REL;
  static LENGTH_SAFETY_PERIOD = HeaderChain.LENGTH_EXPIRY_PERIOD.mul(
    new U32(2),
  );

  headers: Header[];

  constructor(headers: Header[]) {
    this.headers = headers;
  }

  add(header: Header) {
    this.headers.push(header);
  }

  getTip(): Header | null {
    const header = this.headers[this.headers.length - 1];
    if (header) {
      return header;
    }
    return null;
  }

  newHeaderIsValidAt(header: Header, timestamp: U64): boolean {
    return header.isValidAt(this.headers, timestamp);
  }

  newHeaderIsValidNow(header: Header): boolean {
    return header.isValidNow(this.headers);
  }

  getNextMintTxFromPkh(pkh: Pkh, domain: string, blockMessageId: FixedBuf<32>) {
    const working_block_n = (this.getTip()?.blockNum || new U32(0)).add(
      new U32(1),
    );
    const domainBuf = Buffer.from(domain);
    const domainScriptChunk = ScriptChunk.fromData(domainBuf);
    const blockMessageScriptChunk = ScriptChunk.fromData(blockMessageId.buf);
    const inputScript = new Script([
      blockMessageScriptChunk,
      domainScriptChunk,
    ]);
    const outputScript = Script.fromPkhOutput(pkh);
    const outputAmount = Header.mintTxAmount(working_block_n);
    const tx = Tx.fromMintTxOutputScript(
      inputScript,
      outputScript,
      outputAmount,
    );
    return tx;
  }

  getNextMintTxFromTxOuts(
    txOuts: TxOut[],
    domain: string,
    blockMessageId: FixedBuf<32>,
  ) {
    const working_block_n = (this.getTip()?.blockNum || new U32(0)).add(
      new U32(1),
    );
    const domainBuf = Buffer.from(domain);
    const domainScriptChunk = ScriptChunk.fromData(domainBuf);
    const blockMessageScriptChunk = ScriptChunk.fromData(blockMessageId.buf);
    const inputScript = new Script([
      blockMessageScriptChunk,
      domainScriptChunk,
    ]);
    const outputAmount = Header.mintTxAmount(working_block_n);
    // check that the sum of the output amounts is equal to the output amount
    let sum = new U64(0);
    for (const output of txOuts) {
      sum = sum.add(output.value);
    }
    if (sum.bn !== outputAmount.bn) {
      throw new GenericError(
        "output amount does not match sum of output amounts",
      );
    }
    const tx = Tx.fromMintTxTxOuts(inputScript, txOuts);
    return tx;
  }

  getNextHeaderAt(
    rootMerkleNodeId: FixedBuf<32>,
    nTransactions: U64,
    timestamp: U64,
  ) {
    const header = Header.fromLch(
      this.headers,
      rootMerkleNodeId,
      nTransactions,
      timestamp,
    );
  }

  getNextHeaderNow(rootMerkleNodeId: FixedBuf<32>, nTransactions: U64) {
    return this.getNextHeaderAt(
      rootMerkleNodeId,
      nTransactions,
      Header.getNewTimestamp(),
    );
  }

  hasFirstBlockHeader() {
    const firstHeader = this.headers[0];
    return firstHeader?.blockNum.n === 0;
  }

  trimToTargetAdjPeriod() {
    const targetAdjPeriodHeaders = this.headers.slice(
      -HeaderChain.LENGTH_TARGET_ADJ_PERIOD.n,
    );
    return new HeaderChain(targetAdjPeriodHeaders);
  }

  trimToExpiryPeriod() {
    const expiryPeriodHeaders = this.headers.slice(
      -HeaderChain.LENGTH_EXPIRY_PERIOD.n,
    );
    return new HeaderChain(expiryPeriodHeaders);
  }

  trimToSafetyPeriod() {
    const safetyPeriodHeaders = this.headers.slice(
      -HeaderChain.LENGTH_SAFETY_PERIOD.n,
    );
    return new HeaderChain(safetyPeriodHeaders);
  }
}
