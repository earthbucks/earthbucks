import { OPCODE_TO_NAME, OP, OpcodeName, Opcode } from "./opcode.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { SysBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import {
  EbxError,
  InvalidOpcodeError,
  NonMinimalEncodingError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class ScriptChunk {
  opcode: number;
  buf?: SysBuf;

  constructor(opcode: number = 0, buf?: SysBuf) {
    this.opcode = opcode;
    this.buf = buf;
  }

  getData(): Result<SysBuf, EbxError> {
    if (this.opcode === Opcode.OP_1NEGATE) {
      return Ok(SysBuf.from([0x80]));
    } else if (this.opcode === Opcode.OP_0) {
      return Ok(SysBuf.from([]));
    } else if (this.opcode >= Opcode.OP_1 && this.opcode <= Opcode.OP_16) {
      return Ok(SysBuf.from([this.opcode - Opcode.OP_1 + 1]));
    }
    if (this.buf) {
      return Ok(this.buf);
    } else {
      return Err(new NotEnoughDataError());
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
        return Err(new InvalidOpcodeError());
      }
    }
  }

  static fromIsoStr(str: string): Result<ScriptChunk, EbxError> {
    const scriptChunk = new ScriptChunk();
    if (str.startsWith("0x")) {
      scriptChunk.buf = SysBuf.from(str.slice(2), "hex");
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
        return Err(new TooMuchDataError());
      }
    } else {
      function isOpcodeName(str: string): str is OpcodeName {
        return Object.prototype.hasOwnProperty.call(OP, str);
      }
      if (isOpcodeName(str)) {
        const opcode = OP[str];
        scriptChunk.opcode = opcode;
      } else {
        return Err(new InvalidOpcodeError());
      }

      scriptChunk.buf = undefined;
    }
    return Ok(scriptChunk);
  }

  toIsoBuf(): SysBuf {
    const opcode = this.opcode;
    if (opcode === OP.PUSHDATA1 && this.buf) {
      return SysBuf.concat([
        SysBuf.from([opcode]),
        new IsoBufWriter().writeU8(new U8(this.buf.length)).toIsoBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA2 && this.buf) {
      return SysBuf.concat([
        SysBuf.from([opcode]),
        new IsoBufWriter().writeU16BE(new U16(this.buf.length)).toIsoBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA4 && this.buf) {
      return SysBuf.concat([
        SysBuf.from([opcode]),
        new IsoBufWriter().writeU32BE(new U32(this.buf.length)).toIsoBuf(),
        this.buf,
      ]);
    }
    return SysBuf.from([opcode]);
  }

  static fromIsoBuf(buf: SysBuf): Result<ScriptChunk, EbxError> {
    const reader = new IsoBufReader(buf);
    return ScriptChunk.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<ScriptChunk, EbxError> {
    const opcodeRes = reader.readU8();
    if (opcodeRes.err) {
      return opcodeRes;
    }
    const opcode = opcodeRes.val.n;
    const chunk = new ScriptChunk(opcode);
    if (opcode === OP.PUSHDATA1) {
      const lenRes = reader.readU8();
      if (lenRes.err) {
        return lenRes;
      }
      const len = lenRes.unwrap().n;
      const bufferRes = reader.read(len);
      if (bufferRes.err) {
        return bufferRes;
      }
      const buffer = bufferRes.unwrap();
      if (len == 0 || (len === 1 && buffer[0] >= 1 && buffer[0] <= 16)) {
        return Err(new NonMinimalEncodingError());
      }
      chunk.buf = buffer;
    } else if (opcode === OP.PUSHDATA2) {
      const lenRes = reader.readU16BE();
      if (lenRes.err) {
        return lenRes;
      }
      const len = lenRes.unwrap().n;
      if (len <= 0xff) {
        return Err(new NonMinimalEncodingError());
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
      const len = lenRes.unwrap().n;
      if (len <= 0xffff) {
        return Err(new NonMinimalEncodingError());
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

  static fromData(data: SysBuf): ScriptChunk {
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
