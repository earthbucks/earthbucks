import { OP, Opcode } from "./opcode.js";
import { ScriptChunk } from "./script-chunk.js";
import { BufReader } from "@webbuf/rw";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { ScriptNum } from "./script-num.js";
import { TxSignature } from "./tx-signature.js";
import { PubKey } from "./pub-key.js";
import { U8, U16BE, U32BE } from "@webbuf/numbers";
import { Pkh } from "./pkh.js";

export type ScriptTemplateType =
  | "mint-input"
  | "pkh-output"
  | "pkh-input"
  | "pkhx90d-output"
  | "pkhx90d-unexpired-input"
  | "pkhx90d-expired-input"
  | "pkhx1h-output"
  | "pkhx1h-unexpired-input"
  | "pkhx1h-expired-input"
  | "pkhxr90d60d-output"
  | "pkhxr90d60d-unexpired-input"
  | "pkhxr90d60d-recovery-input"
  | "pkhxr90d60d-expired-input"
  | "pkhxr1h40m-output"
  | "pkhxr1h40m-unexpired-input"
  | "pkhxr1h40m-recovery-input"
  | "pkhxr1h40m-expired-input";

export class Script {
  chunks: ScriptChunk[] = [];

  constructor(chunks: ScriptChunk[] = []) {
    this.chunks = chunks;
  }

  toString(): string {
    return this.chunks.map((chunk) => chunk.toString()).join(" ");
  }

  static fromPushOnly(datas: WebBuf[]): Script {
    return new Script(datas.map(ScriptChunk.fromData));
  }

  static fromEmpty(): Script {
    return new Script();
  }

  static fromString(str: string): Script {
    const script = new Script();
    if (str === "") {
      return script;
    }

    const chunks = str.split(" ").map(ScriptChunk.fromString);
    script.chunks = chunks;
    return script;
  }

  toBuf(): WebBuf {
    const bufArray = this.chunks.map((chunk) => chunk.toBuf());
    return WebBuf.concat(bufArray);
  }

  static fromBuf(arr: WebBuf): Script {
    const reader = new BufReader(arr);
    return Script.fromBufReader(reader);
  }

  static fromBufReader(reader: BufReader): Script {
    const script = new Script();
    while (!reader.eof()) {
      const chunk = ScriptChunk.fromBufReader(reader);
      script.chunks.push(chunk);
    }
    return script;
  }

  static fromMultiSigOutput(m: number, pubKeys: WebBuf[]): Script {
    return new Script([
      ScriptChunk.fromSmallNumber(m),
      ...pubKeys.map(ScriptChunk.fromData),
      ScriptChunk.fromSmallNumber(pubKeys.length),
      new ScriptChunk(Opcode.OP_CHECKMULTISIG),
    ]);
  }

  static fromMultiSigInput(sigBufs: WebBuf[]): Script {
    return new Script(sigBufs.map(ScriptChunk.fromData));
  }

  static fromPkhOutput(pkh: Pkh): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh.buf.buf),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
    ]);
  }

  isPkhOutput(): boolean {
    return (
      this.chunks.length === 5 &&
      this.chunks[0]?.opcode === Opcode.OP_DUP &&
      this.chunks[1]?.opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[2]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[2].buf?.length === 32 &&
      this.chunks[3]?.opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[4]?.opcode === Opcode.OP_CHECKSIG
    );
  }

  static fromPkhInput(sigBuf: WebBuf, pubKeyBuf: WebBuf): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
    ]);
  }

  isPkhInput(): boolean {
    return (
      this.chunks.length === 2 &&
      this.chunks[0]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[0].buf?.length === TxSignature.SIZE &&
      this.chunks[1]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === PubKey.SIZE
    );
  }

  static fromPkhInputPlaceholder(): Script {
    const sig = WebBuf.alloc(TxSignature.SIZE);
    const pubKey = WebBuf.alloc(PubKey.SIZE);
    return new Script([
      ScriptChunk.fromData(sig),
      ScriptChunk.fromData(pubKey),
    ]);
  }

  // PKHX 90D = PubKey Hash with Expiry: 90 Days
  // 13104 blocks = 2016 blocks / 14 * 90
  static readonly PKHX_90D_LOCK_REL: U32BE = new U32BE(12960);

  static fromPkhx90dOutput(pkh: Pkh): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh.toBuf().buf),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      ScriptChunk.fromData(
        ScriptNum.fromNumber(Script.PKHX_90D_LOCK_REL.n).toBuf(),
      ),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkhx90dOutput(): boolean {
    return (
      this.chunks.length === 12 &&
      this.chunks[0]?.opcode === Opcode.OP_IF &&
      this.chunks[1]?.opcode === Opcode.OP_DUP &&
      this.chunks[2]?.opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4]?.opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5]?.opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6]?.opcode === Opcode.OP_ELSE &&
      this.chunks[7]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[7].buf?.length === 2 &&
      this.chunks[7].buf &&
      new BufReader(this.chunks[7].buf).readU16BE().n ===
        Script.PKHX_90D_LOCK_REL.n &&
      this.chunks[8]?.opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[9]?.opcode === Opcode.OP_DROP &&
      this.chunks[10]?.opcode === Opcode.OP_1 &&
      this.chunks[11]?.opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhx90dExpired(newBlockNum: U32BE, prevBlockNum: U32BE): boolean {
    return newBlockNum.bn >= prevBlockNum.bn + Script.PKHX_90D_LOCK_REL.bn;
  }

  // PKHXR 90D 60D = PubKey Hash with Expiry: 90 Days
  // And recovery: 60 Days
  // 13104 blocks = 2016 blocks / 14 * 90
  static readonly PKHXR_90D_60D_X_LOCK_REL: U32BE = new U32BE(12960);
  static readonly PKHXR_90D_60D_R_LOCK_REL: U32BE = new U32BE(8640);

  static fromPkhxr90d60dOutput(pkh: Pkh, rpkh: Pkh): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh.toBuf().buf),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      new ScriptChunk(Opcode.OP_IF),
      ScriptChunk.fromData(
        ScriptNum.fromNumber(Script.PKHXR_90D_60D_R_LOCK_REL.n).toBuf(),
      ),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(rpkh.toBuf().buf),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      ScriptChunk.fromData(
        ScriptNum.fromNumber(Script.PKHXR_90D_60D_X_LOCK_REL.n).toBuf(),
      ),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkhxr90d60dOutput(): boolean {
    return (
      this.chunks.length === 23 &&
      this.chunks[0]?.opcode === Opcode.OP_IF &&
      this.chunks[1]?.opcode === Opcode.OP_DUP &&
      this.chunks[2]?.opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4]?.opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5]?.opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6]?.opcode === Opcode.OP_ELSE &&
      this.chunks[7]?.opcode === Opcode.OP_IF &&
      this.chunks[8]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[8].buf?.length === 2 &&
      this.chunks[8].buf &&
      new BufReader(this.chunks[8].buf).readU16BE().n ===
        Script.PKHXR_90D_60D_R_LOCK_REL.n &&
      this.chunks[9]?.opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[10]?.opcode === Opcode.OP_DROP &&
      this.chunks[11]?.opcode === Opcode.OP_DUP &&
      this.chunks[12]?.opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[13]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[13].buf?.length === 32 &&
      this.chunks[14]?.opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[15]?.opcode === Opcode.OP_CHECKSIG &&
      this.chunks[16]?.opcode === Opcode.OP_ELSE &&
      this.chunks[17]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[17].buf?.length === 2 &&
      this.chunks[17].buf &&
      new BufReader(this.chunks[17].buf).readU16BE().n ===
        Script.PKHXR_90D_60D_X_LOCK_REL.n &&
      this.chunks[18]?.opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[19]?.opcode === Opcode.OP_DROP &&
      this.chunks[20]?.opcode === Opcode.OP_1 &&
      this.chunks[21]?.opcode === Opcode.OP_ENDIF &&
      this.chunks[21].opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhxr90d60dExpired(
    newBlockNum: U32BE,
    prevBlockNum: U32BE,
  ): boolean {
    return (
      newBlockNum.bn >= prevBlockNum.bn + Script.PKHXR_90D_60D_X_LOCK_REL.bn
    );
  }

  static isPkhxr90d60dRecoverable(
    newBlockNum: U32BE,
    prevBlockNum: U32BE,
  ): boolean {
    return (
      newBlockNum.bn >= prevBlockNum.bn + Script.PKHXR_90D_60D_R_LOCK_REL.bn
    );
  }

  // PKHX 1H = PubKey Hash Expiry: 1 Hour
  // 6 blocks = 1 hour for 10 min blocks
  static readonly PKHX_1H_LOCK_REL: U32BE = new U32BE(6);

  static fromPkhx1hOutput(pkh: Pkh): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh.toBuf().buf),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      new ScriptChunk(Opcode.OP_6),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkhx1hOutput(): boolean {
    return (
      this.chunks.length === 12 &&
      this.chunks[0]?.opcode === Opcode.OP_IF &&
      this.chunks[1]?.opcode === Opcode.OP_DUP &&
      this.chunks[2]?.opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4]?.opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5]?.opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6]?.opcode === Opcode.OP_ELSE &&
      this.chunks[7]?.opcode === Opcode.OP_6 &&
      this.chunks[8]?.opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[9]?.opcode === Opcode.OP_DROP &&
      this.chunks[10]?.opcode === Opcode.OP_1 &&
      this.chunks[11]?.opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhx1hExpired(newBlockNum: U32BE, prevBlockNum: U32BE): boolean {
    return newBlockNum.bn >= prevBlockNum.bn + Script.PKHX_1H_LOCK_REL.bn;
  }

  // PKHXR 1h 40m = PubKey Hash with Expiry: 1 Hour
  // and Recovery: 40 Minutes
  // 6 blocks = 1 hour for 10 min blocks
  static readonly PKHXR_1H_40M_X_LOCK_REL: U32BE = new U32BE(6);
  static readonly PKHXR_1H_40M_R_LOCK_REL: U32BE = new U32BE(4);

  static fromPkhxr1h40mOutput(pkh: Pkh, rpkh: Pkh): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh.toBuf().buf),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_4),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(rpkh.toBuf().buf),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      new ScriptChunk(Opcode.OP_6),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkhxr1h40mOutput(): boolean {
    return (
      this.chunks.length === 23 &&
      this.chunks[0]?.opcode === Opcode.OP_IF &&
      this.chunks[1]?.opcode === Opcode.OP_DUP &&
      this.chunks[2]?.opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4]?.opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5]?.opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6]?.opcode === Opcode.OP_ELSE &&
      this.chunks[7]?.opcode === Opcode.OP_IF &&
      this.chunks[8]?.opcode === Opcode.OP_4 &&
      this.chunks[9]?.opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[10]?.opcode === Opcode.OP_DROP &&
      this.chunks[11]?.opcode === Opcode.OP_DUP &&
      this.chunks[12]?.opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[13]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[13]?.buf?.length === 32 &&
      this.chunks[14]?.opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[15]?.opcode === Opcode.OP_CHECKSIG &&
      this.chunks[16]?.opcode === Opcode.OP_ELSE &&
      this.chunks[17]?.opcode === Opcode.OP_6 &&
      this.chunks[18]?.opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[19]?.opcode === Opcode.OP_DROP &&
      this.chunks[20]?.opcode === Opcode.OP_1 &&
      this.chunks[21]?.opcode === Opcode.OP_ENDIF &&
      this.chunks[21].opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhxr1h40mExpired(newBlockNum: U32BE, prevBlockNum: U32BE): boolean {
    return (
      newBlockNum.bn >= prevBlockNum.bn + Script.PKHXR_1H_40M_X_LOCK_REL.bn
    );
  }

  static isPkhxr1h40mRecoverable(
    newBlockNum: U32BE,
    prevBlockNum: U32BE,
  ): boolean {
    return (
      newBlockNum.bn >= prevBlockNum.bn + Script.PKHXR_1H_40M_R_LOCK_REL.bn
    );
  }

  static fromExpiredPkhxInput(): Script {
    return new Script([new ScriptChunk(Opcode.OP_0)]);
  }

  isExpiredPkhxInput(): boolean {
    return this.chunks.length === 1 && this.chunks[0]?.opcode === Opcode.OP_0;
  }

  static fromUnexpiredPkhxInput(sigBuf: WebBuf, pubKeyBuf: WebBuf): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
      new ScriptChunk(Opcode.OP_1),
    ]);
  }

  isUnexpiredPkhxInput(): boolean {
    return (
      this.chunks.length === 3 &&
      this.chunks[0]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[0].buf?.length === TxSignature.SIZE &&
      this.chunks[1]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === PubKey.SIZE &&
      this.chunks[2]?.opcode === Opcode.OP_1
    );
  }

  static fromExpiredPkhxrInput(): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_0),
      new ScriptChunk(Opcode.OP_0),
    ]);
  }

  isExpiredPkhxrInput(): boolean {
    return (
      this.chunks.length === 2 &&
      this.chunks[0]?.opcode === Opcode.OP_0 &&
      this.chunks[1]?.opcode === Opcode.OP_0
    );
  }

  static fromRecoveryPkhxrInput(sigBuf: WebBuf, pubKeyBuf: WebBuf): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_0),
    ]);
  }

  static fromRecoveryPkhxrInputPlaceholder(): Script {
    const sig = WebBuf.alloc(TxSignature.SIZE);
    const pubKey = WebBuf.alloc(PubKey.SIZE);
    return Script.fromRecoveryPkhxrInput(sig, pubKey);
  }

  isRecoveryPkhxrInput(): boolean {
    return (
      this.chunks.length === 4 &&
      this.chunks[0]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[0].buf?.length === TxSignature.SIZE &&
      this.chunks[1]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === PubKey.SIZE &&
      this.chunks[2]?.opcode === Opcode.OP_1 &&
      this.chunks[3]?.opcode === Opcode.OP_0
    );
  }

  static fromUnexpiredPkhxInputPlaceholder(): Script {
    const sig = WebBuf.alloc(TxSignature.SIZE);
    const pubKey = WebBuf.alloc(PubKey.SIZE);
    return Script.fromUnexpiredPkhxInput(sig, pubKey);
  }

  static fromUnexpiredPkhxrInput(sigBuf: WebBuf, pubKeyBuf: WebBuf): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
      new ScriptChunk(Opcode.OP_1),
    ]);
  }

  isUnexpiredPkhxrInput(): boolean {
    return (
      this.chunks.length === 3 &&
      this.chunks[0]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[0].buf?.length === TxSignature.SIZE &&
      this.chunks[1]?.opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === PubKey.SIZE &&
      this.chunks[2]?.opcode === Opcode.OP_1
    );
  }

  static fromUnexpiredPkhxrInputPlaceholder(): Script {
    const sig = WebBuf.alloc(TxSignature.SIZE);
    const pubKey = WebBuf.alloc(PubKey.SIZE);
    return Script.fromUnexpiredPkhxrInput(sig, pubKey);
  }

  isPushOnly(): boolean {
    return this.chunks.every((chunk) => chunk.opcode <= Opcode.OP_16);
  }

  isMintTxInput(): boolean {
    // TODO: Add more checks
    return this.isPushOnly() && this.chunks.length >= 3;
  }

  getMintTxData(): {
    nonce: FixedBuf<32>;
    blockMessageId: FixedBuf<32>;
    domain: string;
  } {
    if (!this.isMintTxInput()) {
      throw new Error("Not a mint tx");
    }
    const nonce = FixedBuf.fromBuf(
      32,
      this.chunks[this.chunks.length - 3]?.getData() as WebBuf,
    );
    const blockMessageId = FixedBuf.fromBuf(
      32,
      this.chunks[this.chunks.length - 2]?.getData() as WebBuf,
    );
    const domain = this.chunks[this.chunks.length - 1]
      ?.getData()
      ?.toString("utf8") as string;
    return { nonce, blockMessageId, domain };
  }

  isExpiredInput(): boolean {
    return this.isExpiredPkhxInput() || this.isExpiredPkhxrInput();
  }

  isStandardInput(): boolean {
    return (
      this.isPushOnly() &&
      (this.isUnexpiredPkhxrInput() || this.isRecoveryPkhxrInput())
    );
  }

  isStandardOutput(): boolean {
    return this.isPkhxr1h40mOutput() || this.isPkhxr90d60dOutput();
  }

  getOutputPkhs(): { pkh: Pkh; rpkh: Pkh | null } {
    if (this.isPkhxr90d60dOutput() || this.isPkhxr1h40mOutput()) {
      return {
        pkh: Pkh.fromBuf(FixedBuf.fromBuf(32, this.chunks[3]?.buf as WebBuf)),
        rpkh: Pkh.fromBuf(FixedBuf.fromBuf(32, this.chunks[13]?.buf as WebBuf)),
      };
    }
    if (this.isPkhx90dOutput() || this.isPkhx1hOutput()) {
      return {
        pkh: Pkh.fromBuf(FixedBuf.fromBuf(32, this.chunks[3]?.buf as WebBuf)),
        rpkh: null,
      };
    }
    if (this.isPkhOutput()) {
      return {
        pkh: Pkh.fromBuf(FixedBuf.fromBuf(32, this.chunks[2]?.buf as WebBuf)),
        rpkh: null,
      };
    }
    throw new Error("Invalid Script");
  }

  getInputPubKey(): PubKey {
    if (this.isUnexpiredPkhxrInput() || this.isRecoveryPkhxrInput()) {
      return PubKey.fromBuf(FixedBuf.fromBuf(33, this.chunks[1]?.buf as WebBuf));
    }
    if (this.isUnexpiredPkhxInput()) {
      return PubKey.fromBuf(FixedBuf.fromBuf(33, this.chunks[1]?.buf as WebBuf));
    }
    if (this.isPkhInput()) {
      return PubKey.fromBuf(FixedBuf.fromBuf(33, this.chunks[1]?.buf as WebBuf));
    }
    throw new Error("Invalid Script");
  }

  getInputPkh(): Pkh {
    const pubKey = this.getInputPubKey();
    return Pkh.fromPubKey(pubKey);
  }

  getOutputTemplateType(): ScriptTemplateType {
    if (this.isPkhx90dOutput()) {
      return "pkhx90d-output";
    }
    if (this.isPkhx1hOutput()) {
      return "pkhx1h-output";
    }
    if (this.isPkhxr90d60dOutput()) {
      return "pkhxr90d60d-output";
    }
    if (this.isPkhxr1h40mOutput()) {
      return "pkhxr1h40m-output";
    }
    throw new Error("Invalid Script");
  }

  clone(): Script {
    return new Script(this.chunks.map((chunk) => chunk.clone()));
  }
}
