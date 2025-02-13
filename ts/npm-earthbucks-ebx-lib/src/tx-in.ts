import { BufWriter } from "@webbuf/rw";
import { BufReader } from "@webbuf/rw";
import { Script, ScriptTemplateType } from "./script.js";
import { VarInt } from "./var-int.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

export class TxIn {
  public inputTxId: FixedBuf<32>;
  public inputTxNOut: U32BE;
  public script: Script;
  public lockRel: U32BE;

  constructor(
    inputTxId: FixedBuf<32>,
    inputTxNOut: U32BE,
    script: Script,
    lockRel: U32BE,
  ) {
    this.inputTxId = inputTxId;
    this.inputTxNOut = inputTxNOut;
    this.script = script;
    this.lockRel = lockRel;
  }

  static fromBuf(buf: WebBuf): TxIn {
    const reader = new BufReader(buf);
    return TxIn.fromBufReader(reader);
  }

  static fromBufReader(reader: BufReader): TxIn {
    const inputTxHash = reader.readFixed(32);
    const inputTxIndex = reader.readU32BE();
    const scriptLen = reader.readVarIntU64BE().n;
    const scriptBuf = reader.read(scriptLen);
    const script = Script.fromBuf(scriptBuf);
    const lockRel = reader.readU32BE();
    return new TxIn(inputTxHash, inputTxIndex, script, lockRel);
  }

  toBuf(): WebBuf {
    const writer = new BufWriter();
    writer.write(this.inputTxId.buf);
    writer.writeU32BE(this.inputTxNOut);
    const scriptBuf = this.script.toBuf();
    writer.write(VarInt.fromU32(new U32BE(scriptBuf.length)).toBuf());
    writer.write(scriptBuf);
    writer.writeU32BE(this.lockRel);
    return writer.toBuf();
  }

  isNull(): boolean {
    return (
      this.inputTxId.buf.every((byte) => byte === 0) &&
      this.inputTxNOut.n === 0xffffffff
    );
  }

  isMinimalLock(): boolean {
    return this.lockRel.n === 0;
  }

  isExpiredInputScript(): boolean {
    return this.script.isExpiredInput();
  }

  isStandardInputScript(): boolean {
    return this.script.isStandardInput();
  }

  isMintTx(): boolean {
    return this.isNull() && this.isMinimalLock() && this.script.isMintTxInput();
  }

  static fromMintTxScript(script: Script): TxIn {
    const emptyId = FixedBuf.alloc(32);
    return new TxIn(emptyId, new U32BE(0xffffffff), script, new U32BE(0));
  }

  static fromMintTxData(
    blockMessageId: FixedBuf<32>,
    domain: string,
    nonce: FixedBuf<32> = FixedBuf.fromRandom(32),
  ): TxIn {
    const script = Script.fromPushOnly([
      nonce.buf,
      blockMessageId.buf,
      WebBuf.from(domain, "utf8"),
    ]);
    return TxIn.fromMintTxScript(script);
  }

  getMintTxData(): {
    nonce: FixedBuf<32>;
    blockMessageId: FixedBuf<32>;
    domain: string;
  } {
    return this.script.getMintTxData();
  }

  clone(): TxIn {
    return new TxIn(
      this.inputTxId.clone(),
      new U32BE(this.inputTxNOut.n),
      this.script.clone(),
      new U32BE(this.lockRel.n),
    );
  }
}
