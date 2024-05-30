import { OPCODE_TO_NAME, OP, OpcodeName, Opcode } from "./opcode.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res";
import {
  EbxError,
  InvalidOpcodeError,
  NonMinimalEncodingError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./ebx-error.js";
import { Option, Some, None } from "earthbucks-opt-res";

export class ScriptChunk {
  opcode: number;
  buf?: IsoBuf;

  constructor(opcode: number = 0, buf?: IsoBuf) {
    this.opcode = opcode;
    this.buf = buf;
  }

  getData(): Result<IsoBuf, EbxError> {
    if (this.opcode === Opcode.OP_1NEGATE) {
      return Ok(IsoBuf.from([0x80]));
    } else if (this.opcode === Opcode.OP_0) {
      return Ok(IsoBuf.from([]));
    } else if (this.opcode >= Opcode.OP_1 && this.opcode <= Opcode.OP_16) {
      return Ok(IsoBuf.from([this.opcode - Opcode.OP_1 + 1]));
    }
    if (this.buf) {
      return Ok(this.buf);
    } else {
      return Err(new NotEnoughDataError(None));
    }
  }

  toIsoStr(): Result<string, EbxError> {
    if (this.buf) {
      return Ok(`0x${this.buf.toString("hex")}`);
    } else {
      const name = OPCODE_TO_NAME[this.opcode];
      if (name !== undefined) {
        return Ok(name);
      } else {
        return Err(new InvalidOpcodeError(None));
      }
    }
  }

  static fromIsoStr(str: string): Result<ScriptChunk, EbxError> {
    const scriptChunk = new ScriptChunk();
    if (str.startsWith("0x")) {
      scriptChunk.buf = IsoBuf.from(str.slice(2), "hex");
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
        return Err(new TooMuchDataError(None));
      }
    } else {
      function isOpcodeName(str: string): str is OpcodeName {
        return Object.prototype.hasOwnProperty.call(OP, str);
      }
      if (isOpcodeName(str)) {
        const opcode = OP[str];
        scriptChunk.opcode = opcode;
      } else {
        return Err(new InvalidOpcodeError(None));
      }

      scriptChunk.buf = undefined;
    }
    return Ok(scriptChunk);
  }

  toIsoBuf(): IsoBuf {
    const opcode = this.opcode;
    if (opcode === OP.PUSHDATA1 && this.buf) {
      return IsoBuf.concat([
        IsoBuf.from([opcode]),
        new IsoBufWriter().writeUInt8(this.buf.length).toIsoBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA2 && this.buf) {
      return IsoBuf.concat([
        IsoBuf.from([opcode]),
        new IsoBufWriter().writeUInt16BE(this.buf.length).toIsoBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA4 && this.buf) {
      return IsoBuf.concat([
        IsoBuf.from([opcode]),
        new IsoBufWriter().writeUInt32BE(this.buf.length).toIsoBuf(),
        this.buf,
      ]);
    }
    return IsoBuf.from([opcode]);
  }

  static fromIsoBuf(buf: IsoBuf): Result<ScriptChunk, EbxError> {
    const reader = new IsoBufReader(buf);
    return ScriptChunk.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<ScriptChunk, EbxError> {
    const opcodeRes = reader.readU8();
    if (opcodeRes.err) {
      return opcodeRes;
    }
    const opcode = opcodeRes.val;
    const chunk = new ScriptChunk(opcode);
    if (opcode === OP.PUSHDATA1) {
      const lenRes = reader.readU8();
      if (lenRes.err) {
        return lenRes;
      }
      const len = lenRes.unwrap();
      const bufferRes = reader.read(len);
      if (bufferRes.err) {
        return bufferRes;
      }
      const buffer = bufferRes.unwrap();
      if (len == 0 || (len === 1 && buffer[0] >= 1 && buffer[0] <= 16)) {
        return Err(new NonMinimalEncodingError(None));
      }
      chunk.buf = buffer;
    } else if (opcode === OP.PUSHDATA2) {
      const lenRes = reader.readU16BE();
      if (lenRes.err) {
        return lenRes;
      }
      const len = lenRes.unwrap();
      if (len <= 0xff) {
        return Err(new NonMinimalEncodingError(None));
      }
      const bufferRes = reader.read(len);
      if (bufferRes.err) {
        return bufferRes;
      }
      const buffer = bufferRes.unwrap();
      chunk.buf = buffer;
    } else if (opcode === OP.PUSHDATA4) {
      const lenRes = reader.readU32BE();
      if (lenRes.err) {
        return lenRes;
      }
      const len = lenRes.unwrap();
      if (len <= 0xffff) {
        return Err(new NonMinimalEncodingError(None));
      }
      const bufferRes = reader.read(len);
      if (bufferRes.err) {
        return bufferRes;
      }
      const buffer = bufferRes.unwrap();
      chunk.buf = buffer;
    }
    return Ok(chunk);
  }

  static fromData(data: IsoBuf): ScriptChunk {
    const len = data.length;
    if (len === 0) {
      return new ScriptChunk(Opcode.OP_0);
    } else if (len === 1 && data[0] >= 1 && data[0] <= 16) {
      return new ScriptChunk(data[0] + Opcode.OP_1 - 1);
    } else if (len <= 0xff) {
      return new ScriptChunk(Opcode.OP_PUSHDATA1, data);
    } else if (len <= 0xffff) {
      return new ScriptChunk(Opcode.OP_PUSHDATA2, data);
    } else if (len <= 0xffffffff) {
      return new ScriptChunk(Opcode.OP_PUSHDATA4, data);
    } else {
      return new ScriptChunk(0);
    }
  }

  static fromSmallNumber(n: number): ScriptChunk {
    if (n === -1 || (n >= 1 && n <= 16)) {
      return new ScriptChunk(n + Opcode.OP_1 - 1);
    } else {
      return new ScriptChunk(0);
    }
  }
}
