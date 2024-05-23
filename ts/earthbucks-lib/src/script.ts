import { OP, Opcode } from "./opcode";
import ScriptChunk from "./script-chunk";
import IsoBufReader from "./iso-buf-reader";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "option-result/src/result";
import ScriptNum from "./script-num";
import TxSignature from "./tx-signature";
import PubKey from "./pub-key";
import { EbxError } from "./ebx-error";

export default class Script {
  chunks: ScriptChunk[] = [];

  constructor(chunks: ScriptChunk[] = []) {
    this.chunks = chunks;
  }

  toIsoStr(): Result<string, EbxError> {
    const chunksRes = this.chunks.map((chunk) => chunk.toIsoStr());
    for (const res of chunksRes) {
      if (res.err) {
        return res;
      }
    }
    return Ok(chunksRes.map((res) => res.unwrap()).join(" "));
  }

  static fromEmpty(): Script {
    return new Script();
  }

  static fromIsoStr(str: string): Result<Script, EbxError> {
    const script = new Script();
    if (str === "") {
      return Ok(script);
    }

    const chunksRes = str.split(" ").map(ScriptChunk.fromIsoStr);
    for (const res of chunksRes) {
      if (res.err) {
        return res;
      }
    }
    script.chunks = chunksRes.map((res) => res.unwrap());
    return Ok(script);
  }

  toIsoBuf(): Buffer {
    const bufArray = this.chunks.map((chunk) => chunk.toIsoBuf());
    return Buffer.concat(bufArray);
  }

  static fromIsoBuf(arr: Buffer): Result<Script, EbxError> {
    const reader = new IsoBufReader(arr);
    return Script.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<Script, EbxError> {
    const script = new Script();
    while (!reader.eof()) {
      const chunkRes = ScriptChunk.fromIsoBufReader(reader);
      if (chunkRes.err) {
        return chunkRes;
      }
      script.chunks.push(chunkRes.unwrap());
    }
    return Ok(script);
  }

  static fromMultiSigOutput(m: number, pubKeys: Buffer[]): Script {
    return new Script([
      ScriptChunk.fromSmallNumber(m),
      ...pubKeys.map(ScriptChunk.fromData),
      ScriptChunk.fromSmallNumber(pubKeys.length),
      new ScriptChunk(Opcode.OP_CHECKMULTISIG),
    ]);
  }

  static fromMultiSigInput(sigBufs: Buffer[]): Script {
    return new Script(sigBufs.map(ScriptChunk.fromData));
  }

  static fromPkhOutput(pkh: Buffer): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
    ]);
  }

  isPkhOutput(): boolean {
    return (
      this.chunks.length === 5 &&
      this.chunks[0].opcode === Opcode.OP_DUP &&
      this.chunks[1].opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[2].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[2].buf?.length === 32 &&
      this.chunks[3].opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[4].opcode === Opcode.OP_CHECKSIG
    );
  }

  static fromPkhInput(sigBuf: Buffer, pubKeyBuf: Buffer): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
    ]);
  }

  isPkhInput(): boolean {
    return (
      this.chunks.length === 2 &&
      this.chunks[0].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[0].buf?.length === TxSignature.SIZE &&
      this.chunks[1].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === PubKey.SIZE
    );
  }

  static fromPkhInputPlaceholder(): Script {
    const sig = Buffer.alloc(TxSignature.SIZE);
    const pubKey = Buffer.alloc(PubKey.SIZE);
    return new Script([
      ScriptChunk.fromData(sig),
      ScriptChunk.fromData(pubKey),
    ]);
  }

  // PKHX 90D = PubKey Hash with Expiry: 90 Days
  // 13104 blocks = 2016 blocks / 14 * 90
  static readonly PKHX_90D_LOCK_REL: number = 12960;

  static fromPkhx90dOutput(pkh: Buffer): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      ScriptChunk.fromData(
        ScriptNum.fromNumber(Script.PKHX_90D_LOCK_REL).toIsoBuf(),
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
      this.chunks[0].opcode === Opcode.OP_IF &&
      this.chunks[1].opcode === Opcode.OP_DUP &&
      this.chunks[2].opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4].opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5].opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6].opcode === Opcode.OP_ELSE &&
      this.chunks[7].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[7].buf?.length === 2 &&
      this.chunks[7].buf?.readUInt16BE(0) === Script.PKHX_90D_LOCK_REL &&
      this.chunks[8].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[9].opcode === Opcode.OP_DROP &&
      this.chunks[10].opcode === Opcode.OP_1 &&
      this.chunks[11].opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhx90dExpired(newBlockNum: bigint, prevBlockNum: bigint) {
    return newBlockNum >= prevBlockNum + BigInt(Script.PKHX_90D_LOCK_REL);
  }

  // PKHXR 90D 60D = PubKey Hash with Expiry: 90 Days
  // And recovery: 60 Days
  // 13104 blocks = 2016 blocks / 14 * 90
  static readonly PKHXR_90D_60D_X_LOCK_REL: number = 12960;
  static readonly PKHXR_90D_60D_R_LOCK_REL: number = 8640;

  static fromPkhxr90d60dOutput(pkh: Buffer, rpkh: Buffer): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      new ScriptChunk(Opcode.OP_IF),
      ScriptChunk.fromData(
        ScriptNum.fromNumber(Script.PKHXR_90D_60D_R_LOCK_REL).toIsoBuf(),
      ),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(rpkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      ScriptChunk.fromData(
        ScriptNum.fromNumber(Script.PKHXR_90D_60D_X_LOCK_REL).toIsoBuf(),
      ),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkhxr90d60dOutput(): boolean {
    return (
      this.chunks.length === 22 &&
      this.chunks[0].opcode === Opcode.OP_IF &&
      this.chunks[1].opcode === Opcode.OP_DUP &&
      this.chunks[2].opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4].opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5].opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6].opcode === Opcode.OP_ELSE &&
      this.chunks[7].opcode === Opcode.OP_IF &&
      this.chunks[8].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[8].buf?.length === 2 &&
      this.chunks[8].buf?.readUInt16BE(0) === Script.PKHXR_90D_60D_R_LOCK_REL &&
      this.chunks[9].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[10].opcode === Opcode.OP_DROP &&
      this.chunks[11].opcode === Opcode.OP_DUP &&
      this.chunks[12].opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[13].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[13].buf?.length === 32 &&
      this.chunks[14].opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[15].opcode === Opcode.OP_CHECKSIG &&
      this.chunks[16].opcode === Opcode.OP_ELSE &&
      this.chunks[17].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[17].buf?.length === 2 &&
      this.chunks[17].buf?.readUInt16BE(0) ===
        Script.PKHXR_90D_60D_X_LOCK_REL &&
      this.chunks[18].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[19].opcode === Opcode.OP_DROP &&
      this.chunks[20].opcode === Opcode.OP_1 &&
      this.chunks[21].opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhxr90d60dExpired(newBlockNum: bigint, prevBlockNum: bigint) {
    return (
      newBlockNum >= prevBlockNum + BigInt(Script.PKHXR_90D_60D_X_LOCK_REL)
    );
  }

  static isPkhxr90d60dRecoverable(newBlockNum: bigint, prevBlockNum: bigint) {
    return (
      newBlockNum >= prevBlockNum + BigInt(Script.PKHXR_90D_60D_R_LOCK_REL)
    );
  }

  // PKHX 1H = PubKey Hash Expiry: 1 Hour
  // 6 blocks = 1 hour for 10 min blocks
  static readonly PKHX_1H_LOCK_REL: number = 6;

  static fromPkhx1hOutput(pkh: Buffer): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
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
      this.chunks[0].opcode === Opcode.OP_IF &&
      this.chunks[1].opcode === Opcode.OP_DUP &&
      this.chunks[2].opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4].opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5].opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6].opcode === Opcode.OP_ELSE &&
      this.chunks[7].opcode === Opcode.OP_6 &&
      this.chunks[8].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[9].opcode === Opcode.OP_DROP &&
      this.chunks[10].opcode === Opcode.OP_1 &&
      this.chunks[11].opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhx1hExpired(newBlockNum: bigint, prevBlockNum: bigint) {
    return newBlockNum >= prevBlockNum + BigInt(Script.PKHX_1H_LOCK_REL);
  }

  // PKHXR 1h 40m = PubKey Hash with Expiry: 1 Hour
  // and Recovery: 40 Minutes
  // 6 blocks = 1 hour for 10 min blocks
  static readonly PKHXR_1H_40M_X_LOCK_REL: number = 6;
  static readonly PKHXR_1H_40M_R_LOCK_REL: number = 4;

  static fromPkhxr1h40mOutput(pkh: Buffer, rpkh: Buffer): Script {
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_4),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(rpkh),
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

  isPkhxr1h40mOutput(): boolean {
    return (
      this.chunks.length === 22 &&
      this.chunks[0].opcode === Opcode.OP_IF &&
      this.chunks[1].opcode === Opcode.OP_DUP &&
      this.chunks[2].opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[3].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[3].buf?.length === 32 &&
      this.chunks[4].opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[5].opcode === Opcode.OP_CHECKSIG &&
      this.chunks[6].opcode === Opcode.OP_ELSE &&
      this.chunks[7].opcode === Opcode.OP_IF &&
      this.chunks[8].opcode === Opcode.OP_4 &&
      this.chunks[9].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[10].opcode === Opcode.OP_DROP &&
      this.chunks[11].opcode === Opcode.OP_DUP &&
      this.chunks[12].opcode === Opcode.OP_DOUBLEBLAKE3 &&
      this.chunks[13].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[13].buf?.length === 32 &&
      this.chunks[14].opcode === Opcode.OP_EQUALVERIFY &&
      this.chunks[15].opcode === Opcode.OP_CHECKSIG &&
      this.chunks[16].opcode === Opcode.OP_ELSE &&
      this.chunks[17].opcode === Opcode.OP_6 &&
      this.chunks[18].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[19].opcode === Opcode.OP_DROP &&
      this.chunks[20].opcode === Opcode.OP_1 &&
      this.chunks[21].opcode === Opcode.OP_ENDIF
    );
  }

  static isPkhxr1h40mExpired(newBlockNum: bigint, prevBlockNum: bigint) {
    return newBlockNum >= prevBlockNum + BigInt(Script.PKHXR_1H_40M_X_LOCK_REL);
  }

  static isPkhxr1h40mRecoverable(newBlockNum: bigint, prevBlockNum: bigint) {
    return newBlockNum >= prevBlockNum + BigInt(Script.PKHXR_1H_40M_R_LOCK_REL);
  }
  static fromExpiredPkhxInput(): Script {
    return new Script([new ScriptChunk(Opcode.OP_0)]);
  }

  isExpiredPkhxInput(): boolean {
    return this.chunks.length === 1 && this.chunks[0].opcode === Opcode.OP_0;
  }

  static fromUnexpiredPkhxInput(sigBuf: Buffer, pubKeyBuf: Buffer): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
      new ScriptChunk(Opcode.OP_1),
    ]);
  }

  isUnexpiredPkhxInput(): boolean {
    return (
      this.chunks.length === 3 &&
      this.chunks[0].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[0].buf?.length === TxSignature.SIZE &&
      this.chunks[1].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === PubKey.SIZE &&
      this.chunks[2].opcode === Opcode.OP_1
    );
  }

  static fromUnexpiredPkhxInputPlaceholder(): Script {
    const sig = Buffer.alloc(TxSignature.SIZE);
    const pubKey = Buffer.alloc(PubKey.SIZE);
    return Script.fromUnexpiredPkhxInput(sig, pubKey);
  }

  static fromUnexpiredPkhxrInput(sigBuf: Buffer, pubKeyBuf: Buffer): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
      new ScriptChunk(Opcode.OP_1),
    ]);
  }

  isUnexpiredPkhxrInput(): boolean {
    return (
      this.chunks.length === 3 &&
      this.chunks[0].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[0].buf?.length === TxSignature.SIZE &&
      this.chunks[1].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === PubKey.SIZE &&
      this.chunks[2].opcode === Opcode.OP_1
    );
  }

  static fromUnexpiredPkhxrInputPlaceholder(): Script {
    const sig = Buffer.alloc(TxSignature.SIZE);
    const pubKey = Buffer.alloc(PubKey.SIZE);
    return Script.fromUnexpiredPkhxrInput(sig, pubKey);
  }

  isPushOnly(): boolean {
    return this.chunks.every((chunk) => chunk.opcode <= Opcode.OP_16);
  }

  isCoinbaseInput(): boolean {
    // TODO: Add more checks
    return this.isPushOnly();
  }

  isStandardInput(): boolean {
    return (
      this.isPushOnly() &&
      (this.isUnexpiredPkhxInput() || this.isExpiredPkhxInput())
    );
  }

  isStandardOutput(): boolean {
    return this.isPkhx90dOutput() || this.isPkhx1hOutput();
  }
}
