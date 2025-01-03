import { Header } from "./header.js";
import { U32BE } from "@webbuf/numbers";
import { U64BE } from "@webbuf/numbers";
import type { Pkh } from "./pkh.js";
import { ScriptChunk } from "./script-chunk.js";
import { Script } from "./script.js";
import type { FixedBuf } from "@webbuf/fixedbuf";
import { Tx } from "./tx.js";
import type { TxOut } from "./tx-out.js";
import { WebBuf } from "@webbuf/webbuf";

export class HeaderChain {
  static LENGTH_EXPIRY_PERIOD = Script.PKHXR_90D_60D_X_LOCK_REL;
  static LENGTH_SAFETY_PERIOD = HeaderChain.LENGTH_EXPIRY_PERIOD.mul(
    new U32BE(2),
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

  newHeaderIsValidAt(
    header: Header,
    actualNTransactions: U64BE,
    timestamp: U64BE,
  ): boolean {
    const prevHeader = this.headers[this.headers.length - 1] || null;
    if (!prevHeader) {
      throw new Error("no previous header");
    }
    const prevPrevHeader = this.headers[this.headers.length - 2] || null;
    return !!header.resIsValidAt(
      prevHeader,
      prevPrevHeader,
      actualNTransactions,
      timestamp,
    ).value;
  }

  newHeaderIsValidNow(header: Header, actualNTransactions: U64BE): boolean {
    const prevHeader = this.headers[this.headers.length - 1] || null;
    if (!prevHeader) {
      throw new Error("no previous header");
    }
    const prevPrevHeader = this.headers[this.headers.length - 2] || null;
    return !!header.resIsValidNow(
      prevHeader,
      prevPrevHeader,
      actualNTransactions,
    ).value;
  }

  getNextMintTxFromPkh(
    pkh: Pkh,
    domain: string,
    blockMessageId: FixedBuf<32>,
    blockNum: U32BE,
  ) {
    const working_block_n = (this.getTip()?.blockNum || new U32BE(0)).add(
      new U32BE(1),
    );
    const domainBuf = WebBuf.from(domain);
    const domainScriptChunk = ScriptChunk.fromData(domainBuf);
    const blockMessageScriptChunk = ScriptChunk.fromData(blockMessageId.buf);
    const inputScript = new Script([
      blockMessageScriptChunk,
      domainScriptChunk,
    ]);
    const outputScript = Script.fromPkhOutput(pkh);
    const outputAmount = Header.mintTxAmount(working_block_n);
    const tx = Tx.fromMintTxScripts(
      inputScript,
      outputScript,
      outputAmount,
      blockNum,
    );
    return tx;
  }

  getNextMintTxFromTxOuts(
    txOuts: TxOut[],
    domain: string,
    blockMessageId: FixedBuf<32>,
    blockNum: U32BE,
  ) {
    const working_block_n = (this.getTip()?.blockNum || new U32BE(0)).add(
      new U32BE(1),
    );
    const domainBuf = WebBuf.from(domain);
    const domainScriptChunk = ScriptChunk.fromData(domainBuf);
    const blockMessageScriptChunk = ScriptChunk.fromData(blockMessageId.buf);
    const inputScript = new Script([
      blockMessageScriptChunk,
      domainScriptChunk,
    ]);
    const outputAmount = Header.mintTxAmount(working_block_n);
    // check that the sum of the output amounts is equal to the output amount
    let sum = new U64BE(0);
    for (const output of txOuts) {
      sum = sum.add(output.value);
    }
    if (sum.bn !== outputAmount.bn) {
      throw new Error("output amount does not match sum of output amounts");
    }
    const tx = Tx.fromMintTxTxOuts(inputScript, txOuts, blockNum);
    return tx;
  }

  getNextHeaderAt(
    rootMerkleTreeId: FixedBuf<32>,
    nTransactions: U64BE,
    timestamp: U64BE,
  ) {
    const prevHeader = this.headers[this.headers.length - 1] || null;
    if (!prevHeader) {
      throw new Error("no previous header");
    }
    const prevPrevHeader = this.headers[this.headers.length - 2] || null;
    const header = Header.fromChain(
      prevHeader,
      prevPrevHeader,
      rootMerkleTreeId,
      nTransactions,
      timestamp,
    );
    return header;
  }

  getNextHeaderNow(rootMerkleTreeId: FixedBuf<32>, nTransactions: U64BE) {
    return this.getNextHeaderAt(
      rootMerkleTreeId,
      nTransactions,
      Header.getNewTimestamp(),
    );
  }

  hasFirstBlockHeader() {
    const firstHeader = this.headers[0];
    return firstHeader?.blockNum.n === 0;
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
