import { OPCODE_TO_NAME, OP, OpcodeName } from "./opcode";
import BufferWriter from "./buffer-writer";
import { Buffer } from "buffer";

export default class ScriptChunk {
  opcode: number;
  buf?: Buffer;

  constructor(opcode: number = 0, buf?: Buffer) {
    this.opcode = opcode;
    this.buf = buf;
  }

  toString(): string {
    if (this.buf) {
      return `0x${this.buf.toString("hex")}`;
    } else {
      const name = OPCODE_TO_NAME[this.opcode];
      if (name !== undefined) {
        return name;
      } else {
        throw new Error("invalid opcode");
      }
    }
  }

  fromString(str: string): this {
    if (str.startsWith("0x")) {
      this.buf = Buffer.from(str.slice(2), "hex");
      const len = this.buf.length;
      const onebytelen = len <= 0xff;
      const twobytelen = len <= 0xffff;
      const fourbytelen = len <= 0xffffffff;
      if (onebytelen) {
        this.opcode = OP.PUSHDATA1;
      } else if (twobytelen) {
        this.opcode = OP.PUSHDATA2;
      } else if (fourbytelen) {
        this.opcode = OP.PUSHDATA4;
      } else {
        throw new Error("too much data");
      }
    } else {
      function isOpcodeName(str: string): str is OpcodeName {
        return OP.hasOwnProperty(str);
      }
      if (isOpcodeName(str)) {
        const opcode = OP[str];
        this.opcode = opcode;
      } else {
        throw new Error("invalid opcode");
      }

      this.buf = undefined;
    }
    return this;
  }

  static fromString(str: string): ScriptChunk {
    return new ScriptChunk().fromString(str);
  }

  toBuffer(): Buffer {
    const opcode = this.opcode;
    if (opcode === OP.PUSHDATA1 && this.buf) {
      return Buffer.concat([
        Buffer.from([opcode]),
        new BufferWriter().writeUInt8(this.buf.length).toBuffer(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA2 && this.buf) {
      return Buffer.concat([
        Buffer.from([opcode]),
        new BufferWriter().writeUInt16BE(this.buf.length).toBuffer(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA4 && this.buf) {
      return Buffer.concat([
        Buffer.from([opcode]),
        new BufferWriter().writeUInt32BE(this.buf.length).toBuffer(),
        this.buf,
      ]);
    }
    return Buffer.from([opcode]);
  }

  fromBuffer(buf: Buffer): this {
    const opcode = buf[0];
    if (opcode === OP.PUSHDATA1) {
      const len = buf[1];
      if (buf.byteLength < len + 2) {
        throw new Error("Buffer length is other than expected");
      }
      this.opcode = opcode;
      this.buf = Buffer.from(buf.buffer, buf.byteOffset + 2, len);
    } else if (opcode === OP.PUSHDATA2) {
      const len = buf.readUInt16BE(1);
      if (buf.byteLength < len + 3) {
        throw new Error("Buffer length is other than expected");
      }
      this.opcode = opcode;
      this.buf = Buffer.from(buf.buffer, buf.byteOffset + 3, len);
    } else if (opcode === OP.PUSHDATA4) {
      const len = buf.readUInt32BE(1);
      if (buf.byteLength < len + 5) {
        throw new Error("Buffer length is other than expected");
      }
      this.opcode = opcode;
      this.buf = Buffer.from(buf.buffer, buf.byteOffset + 5, len);
    } else {
      this.opcode = opcode;
      this.buf = undefined;
    }
    return this;
  }

  static fromBuffer(buf: Buffer): ScriptChunk {
    return new ScriptChunk().fromBuffer(buf);
  }

  static fromData(data: Buffer): ScriptChunk {
    const len = data.length;
    if (len <= 0xff) {
      return new ScriptChunk(OP.PUSHDATA1, data);
    } else if (len <= 0xffff) {
      return new ScriptChunk(OP.PUSHDATA2, data);
    } else if (len <= 0xffffffff) {
      return new ScriptChunk(OP.PUSHDATA4, data);
    } else {
      return new ScriptChunk(0);
    }
  }

  static fromSmallNumber(n: number): ScriptChunk {
    if (n === -1 || (n >= 1 && n <= 16)) {
      return new ScriptChunk(n + OP["1"] - 1);
    } else {
      return new ScriptChunk(0);
    }
  }
}
