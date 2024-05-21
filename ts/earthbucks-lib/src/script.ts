import { OP, Opcode } from "./opcode";
import ScriptChunk from "./script-chunk";
import IsoBufReader from "./iso-buf-reader";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";
import ScriptNum from "./script-num";
import TxSignature from "./tx-signature";
import PubKey from "./pub-key";

export default class Script {
  chunks: ScriptChunk[] = [];

  constructor(chunks: ScriptChunk[] = []) {
    this.chunks = chunks;
  }

  toIsoStr(): Result<string, string> {
    const chunksRes = this.chunks.map((chunk) =>
      chunk.toIsoStr().mapErr((err) => `Unable to stringify chunk: ${err}`),
    );
    if (chunksRes.some((res) => res.err)) {
      return Err(
        chunksRes.map((res, i) => `Chunk ${i}: ${res.err}`).join(", "),
      );
    }
    return Ok(chunksRes.map((res) => res.unwrap()).join(" "));
  }

  static fromEmpty(): Script {
    return new Script();
  }

  static fromIsoStr(str: string): Result<Script, string> {
    const script = new Script();
    if (str === "") {
      return Ok(script);
    }

    if (/ {2,}/.test(str)) {
      return Err("String should not contain two or more consecutive spaces");
    }

    const chunksRes = str
      .split(" ")
      .map(ScriptChunk.fromIsoStr)
      .map((res) =>
        res.mapErr((err) => `Unable to parse script chunk: ${err}`),
      );
    if (chunksRes.some((res) => res.err)) {
      return Err(
        chunksRes.map((res, i) => `Chunk ${i}: ${res.err}`).join(", "),
      );
    }
    script.chunks = chunksRes.map((res) => res.unwrap());
    return Ok(script);
  }

  toIsoBuf(): Buffer {
    const bufArray = this.chunks.map((chunk) => chunk.toIsoBuf());
    return Buffer.concat(bufArray);
  }

  static fromIsoBuf(arr: Buffer): Result<Script, string> {
    const reader = new IsoBufReader(arr);
    return Script.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<Script, string> {
    const script = new Script();
    while (!reader.eof()) {
      const chunkRes = ScriptChunk.fromIsoBufReader(reader);
      if (chunkRes.err) {
        return chunkRes.mapErr((err) => `${err}`);
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
