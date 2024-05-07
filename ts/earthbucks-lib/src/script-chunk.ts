import { OPCODE_TO_NAME, OP, OpcodeName } from "./opcode";
import IsoBufWriter from "./iso-buf-writer";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "ts-results";

export default class ScriptChunk {
  opcode: number;
  buf?: Buffer;

  constructor(opcode: number = 0, buf?: Buffer) {
    this.opcode = opcode;
    this.buf = buf;
  }

  toIsoStr(): Result<string, string> {
    if (this.buf) {
      return Ok(`0x${this.buf.toString("hex")}`);
    } else {
      const name = OPCODE_TO_NAME[this.opcode];
      if (name !== undefined) {
        return Ok(name);
      } else {
        return Err("invalid opcode");
      }
    }
  }

  static fromIsoStr(str: string): Result<ScriptChunk, string> {
    const scriptChunk = new ScriptChunk();
    if (str.startsWith("0x")) {
      scriptChunk.buf = Buffer.from(str.slice(2), "hex");
      const len = scriptChunk.buf.length;
      const onebytelen = len <= 0xff;
      const twobytelen = len <= 0xffff;
      const fourbytelen = len <= 0xffffffff;
      if (onebytelen) {
        scriptChunk.opcode = OP.PUSHDATA1;
      } else if (twobytelen) {
        scriptChunk.opcode = OP.PUSHDATA2;
      } else if (fourbytelen) {
        scriptChunk.opcode = OP.PUSHDATA4;
      } else {
        return Err("too much data");
      }
    } else {
      function isOpcodeName(str: string): str is OpcodeName {
        return OP.hasOwnProperty(str);
      }
      if (isOpcodeName(str)) {
        const opcode = OP[str];
        scriptChunk.opcode = opcode;
      } else {
        return Err("invalid opcode");
      }

      scriptChunk.buf = undefined;
    }
    return Ok(scriptChunk);
  }

  toIsoBuf(): Buffer {
    const opcode = this.opcode;
    if (opcode === OP.PUSHDATA1 && this.buf) {
      return Buffer.concat([
        Buffer.from([opcode]),
        new IsoBufWriter().writeUInt8(this.buf.length).toIsoBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA2 && this.buf) {
      return Buffer.concat([
        Buffer.from([opcode]),
        new IsoBufWriter().writeUInt16BE(this.buf.length).toIsoBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA4 && this.buf) {
      return Buffer.concat([
        Buffer.from([opcode]),
        new IsoBufWriter().writeUInt32BE(this.buf.length).toIsoBuf(),
        this.buf,
      ]);
    }
    return Buffer.from([opcode]);
  }

  static fromIsoBuf(buf: Buffer): Result<ScriptChunk, string> {
    const scriptChunk = new ScriptChunk();
    const opcode = buf[0];
    if (opcode === OP.PUSHDATA1) {
      const len = buf[1];
      if (buf.byteLength < len + 2) {
        return Err("Buffer length is other than expected");
      }
      scriptChunk.opcode = opcode;
      scriptChunk.buf = Buffer.from(buf.buffer, buf.byteOffset + 2, len);
    } else if (opcode === OP.PUSHDATA2) {
      const len = buf.readUInt16BE(1);
      if (buf.byteLength < len + 3) {
        return Err("Buffer length is other than expected");
      }
      scriptChunk.opcode = opcode;
      scriptChunk.buf = Buffer.from(buf.buffer, buf.byteOffset + 3, len);
    } else if (opcode === OP.PUSHDATA4) {
      const len = buf.readUInt32BE(1);
      if (buf.byteLength < len + 5) {
        return Err("Buffer length is other than expected");
      }
      scriptChunk.opcode = opcode;
      scriptChunk.buf = Buffer.from(buf.buffer, buf.byteOffset + 5, len);
    } else {
      scriptChunk.opcode = opcode;
      scriptChunk.buf = undefined;
    }
    return Ok(scriptChunk);
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
