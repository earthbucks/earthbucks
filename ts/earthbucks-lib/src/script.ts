import { OP, Opcode } from "./opcode";
import ScriptChunk from "./script-chunk";
import IsoBufReader from "./iso-buf-reader";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";
import ScriptNum from "./script-num";

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
      return new Err(
        chunksRes.map((res, i) => `Chunk ${i}: ${res.err}`).join(", "),
      );
    }
    return new Ok(chunksRes.map((res) => res.unwrap()).join(" "));
  }

  static fromIsoStr(str: string): Result<Script, string> {
    const script = new Script();
    if (str === "") {
      return new Ok(script);
    }

    if (/ {2,}/.test(str)) {
      return new Err(
        "String should not contain two or more consecutive spaces",
      );
    }

    const chunksRes = str
      .split(" ")
      .map(ScriptChunk.fromIsoStr)
      .map((res) =>
        res.mapErr((err) => `Unable to parse script chunk: ${err}`),
      );
    if (chunksRes.some((res) => res.err)) {
      return new Err(
        chunksRes.map((res, i) => `Chunk ${i}: ${res.err}`).join(", "),
      );
    }
    script.chunks = chunksRes.map((res) => res.unwrap());
    return new Ok(script);
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
    let script = new Script();
    while (!reader.eof()) {
      const chunkRes = ScriptChunk.fromIsoBufReader(reader);
      if (chunkRes.err) {
        return chunkRes.mapErr((err) => `script::from_iso_buf_reader: ${err}`);
      }
      script.chunks.push(chunkRes.unwrap());
    }
    return new Ok(script);
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
      this.chunks[0].buf?.length === 65 &&
      this.chunks[1].opcode === Opcode.OP_PUSHDATA1 &&
      this.chunks[1].buf?.length === 33
    );
  }

  static fromPkhInputPlaceholder(): Script {
    const sig = Buffer.alloc(65);
    sig.fill(0);
    const pubKey = Buffer.alloc(33);
    pubKey.fill(0);
    return new Script([
      ScriptChunk.fromData(sig),
      ScriptChunk.fromData(pubKey),
    ]);
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

  // PKH1YX = PubKey Hash with 1 Year Expiry
  static fromPkh1yxOutput(pkh: Buffer): Script {
    const lockRel = 52416;
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      ScriptChunk.fromData(ScriptNum.fromNumber(lockRel).toIsoBuf()),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkh1yxOutput(): boolean {
    const lockRel = 52416;
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
      this.chunks[7].opcode === Opcode.OP_PUSHDATA2 &&
      this.chunks[7].buf?.readUInt16BE(0) === lockRel &&
      this.chunks[8].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[8].opcode === Opcode.OP_DROP &&
      this.chunks[10].opcode === Opcode.OP_1 &&
      this.chunks[11].opcode === Opcode.OP_ENDIF
    );
  }

  // PKH2WX = PubKey Hash with 2 Week Expiry
  static fromPkh2wxOutput(pkh: Buffer): Script {
    const lockRel = 2016;
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      ScriptChunk.fromData(ScriptNum.fromNumber(lockRel).toIsoBuf()),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkh2wxOutput(): boolean {
    const lockRel = 2016;
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
      this.chunks[7].opcode === Opcode.OP_PUSHDATA2 &&
      this.chunks[7].buf?.readUInt16BE(0) === lockRel &&
      this.chunks[8].opcode === Opcode.OP_CHECKLOCKRELVERIFY &&
      this.chunks[9].opcode === Opcode.OP_DROP &&
      this.chunks[10].opcode === Opcode.OP_1 &&
      this.chunks[11].opcode === Opcode.OP_ENDIF
    );
  }

  // PKH1HX = PubKey Hash with 1 Hour Expiry
  static fromPkh1hxOutput(pkh: Buffer): Script {
    const lockRel = 6;
    return new Script([
      new ScriptChunk(Opcode.OP_IF),
      new ScriptChunk(Opcode.OP_DUP),
      new ScriptChunk(Opcode.OP_DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(Opcode.OP_EQUALVERIFY),
      new ScriptChunk(Opcode.OP_CHECKSIG),
      new ScriptChunk(Opcode.OP_ELSE),
      ScriptChunk.fromSmallNumber(lockRel),
      new ScriptChunk(Opcode.OP_CHECKLOCKRELVERIFY),
      new ScriptChunk(Opcode.OP_DROP),
      new ScriptChunk(Opcode.OP_1),
      new ScriptChunk(Opcode.OP_ENDIF),
    ]);
  }

  isPkh1hxOutput(): boolean {
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

  static fromExpiredInput(): Script {
    return new Script([new ScriptChunk(Opcode.OP_0)]);
  }

  isExpiredInput(): boolean {
    return this.chunks.length === 1 && this.chunks[0].opcode === Opcode.OP_0;
  }

  static fromUnexpiredPkhInput(sigBuf: Buffer, pubKeyBuf: Buffer): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
      new ScriptChunk(Opcode.OP_1),
    ]);
  }

  isPushOnly(): boolean {
    return this.chunks.every((chunk) => chunk.opcode <= Opcode.OP_PUSHDATA4);
  }

  isStandardInput(): boolean {
    return this.isPushOnly();
  }

  isStandardOutput(): boolean {
    return (
      this.isPkh2wxOutput() || this.isPkh1yxOutput() || this.isPkh1hxOutput()
    );
  }
}
