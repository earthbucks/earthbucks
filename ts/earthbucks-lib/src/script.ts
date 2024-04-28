import { OP } from "./opcode";
import ScriptChunk from "./script-chunk";
import BufferReader from "./buffer-reader";
import { Buffer } from "buffer";

export default class Script {
  chunks: ScriptChunk[] = [];

  constructor(chunks: ScriptChunk[] = []) {
    this.chunks = chunks;
  }

  fromString(str: string): this {
    if (str === "") {
      return this;
    }
    this.chunks = str.split(" ").map(ScriptChunk.fromString);
    return this;
  }

  static fromString(str: string): Script {
    return new Script().fromString(str);
  }

  toString(): string {
    return this.chunks.map((chunk) => chunk.toString()).join(" ");
  }

  toBuffer(): Buffer {
    const bufArray = this.chunks.map((chunk) => chunk.toBuffer());
    return Buffer.concat(bufArray);
  }

  fromU8Vec(arr: Buffer): this {
    const reader = new BufferReader(arr);
    while (!reader.eof()) {
      const chunk = new ScriptChunk();
      chunk.opcode = reader.readUInt8();
      if (chunk.opcode <= OP.PUSHDATA4) {
        let len = chunk.opcode;
        if (len === OP.PUSHDATA1) {
          len = reader.readUInt8();
        } else if (len === OP.PUSHDATA2) {
          len = reader.readUInt16LE();
        } else if (len === OP.PUSHDATA4) {
          len = reader.readUInt32LE();
        }
        chunk.buf = Buffer.from(reader.readBuffer(len));
        if (chunk.buf.length !== len) {
          throw new Error("invalid buffer length");
        }
      }
      this.chunks.push(chunk);
    }
    return this;
  }

  static fromU8Vec(arr: Buffer): Script {
    return new Script().fromU8Vec(arr);
  }

  static fromAddressOutput(pkh: Buffer): Script {
    return new Script([
      new ScriptChunk(OP.DUP),
      new ScriptChunk(OP.DOUBLEBLAKE3),
      ScriptChunk.fromData(pkh),
      new ScriptChunk(OP.EQUALVERIFY),
      new ScriptChunk(OP.CHECKSIG),
    ]);
  }

  isAddressOutput(): boolean {
    return (
      this.chunks.length === 5 &&
      this.chunks[0].opcode === OP.DUP &&
      this.chunks[1].opcode === OP.DOUBLEBLAKE3 &&
      this.chunks[2].opcode === OP.PUSHDATA1 &&
      this.chunks[2].buf?.length === 32 &&
      this.chunks[3].opcode === OP.EQUALVERIFY &&
      this.chunks[4].opcode === OP.CHECKSIG
    );
  }

  static fromAddressInput(sigBuf: Buffer, pubKeyBuf: Buffer): Script {
    return new Script([
      ScriptChunk.fromData(sigBuf),
      ScriptChunk.fromData(pubKeyBuf),
    ]);
  }

  isAddressInput(): boolean {
    return (
      this.chunks.length === 2 &&
      this.chunks[0].opcode === OP["PUSHDATA1"] &&
      this.chunks[0].buf?.length === 65 &&
      this.chunks[1].opcode === OP["PUSHDATA1"] &&
      this.chunks[1].buf?.length === 33
    );
  }

  static fromAddressInputPlaceholder(): Script {
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
      new ScriptChunk(OP.CHECKMULTISIG),
    ]);
  }

  static fromMultiSigInput(sigBufs: Buffer[]): Script {
    return new Script(sigBufs.map(ScriptChunk.fromData));
  }

  isPushOnly(): boolean {
    return this.chunks.every((chunk) => chunk.opcode <= OP.PUSHDATA4);
  }
}
