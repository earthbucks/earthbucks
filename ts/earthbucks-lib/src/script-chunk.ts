import { OPCODE_TO_NAME, OP, OpcodeName, Opcode } from "./opcode.js";
import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import { SysBuf } from "./ebx-buf.js";
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

  getData(): SysBuf {
    if (this.opcode === Opcode.OP_1NEGATE) {
      return SysBuf.from([0x80]);
    } else if (this.opcode === Opcode.OP_0) {
      return SysBuf.from([]);
    } else if (this.opcode >= Opcode.OP_1 && this.opcode <= Opcode.OP_16) {
      return SysBuf.from([this.opcode - Opcode.OP_1 + 1]);
    }
    if (this.buf) {
      return this.buf;
    } else {
      throw new NotEnoughDataError();
    }
  }

  toIsoStr(): string {
    if (this.buf) {
      return `0x${this.buf.toString("hex")}`;
    } else {
      const name = OPCODE_TO_NAME[this.opcode];
      if (name !== undefined) {
        return name;
      } else {
        throw new InvalidOpcodeError();
      }
    }
  }

  static fromIsoStr(str: string): ScriptChunk {
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
        throw new TooMuchDataError();
      }
    } else {
      function isOpcodeName(str: string): str is OpcodeName {
        return Object.prototype.hasOwnProperty.call(OP, str);
      }
      if (isOpcodeName(str)) {
        const opcode = OP[str];
        scriptChunk.opcode = opcode;
      } else {
        throw new InvalidOpcodeError();
      }

      scriptChunk.buf = undefined;
    }
    return scriptChunk;
  }

  toEbxBuf(): SysBuf {
    const opcode = this.opcode;
    if (opcode === OP.PUSHDATA1 && this.buf) {
      return SysBuf.concat([
        SysBuf.from([opcode]),
        new BufWriter().writeU8(new U8(this.buf.length)).toSysBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA2 && this.buf) {
      return SysBuf.concat([
        SysBuf.from([opcode]),
        new BufWriter().writeU16BE(new U16(this.buf.length)).toSysBuf(),
        this.buf,
      ]);
    } else if (opcode === OP.PUSHDATA4 && this.buf) {
      return SysBuf.concat([
        SysBuf.from([opcode]),
        new BufWriter().writeU32BE(new U32(this.buf.length)).toSysBuf(),
        this.buf,
      ]);
    }
    return SysBuf.from([opcode]);
  }

  static fromEbxBuf(buf: SysBuf): ScriptChunk {
    const reader = new BufReader(buf);
    return ScriptChunk.fromEbxBufReader(reader);
  }

  static fromEbxBufReader(reader: BufReader): ScriptChunk {
    const opcode = reader.readU8().n;
    const chunk = new ScriptChunk(opcode);
    if (opcode === OP.PUSHDATA1) {
      const len = reader.readU8().n;
      const buffer = reader.read(len);
      if (len == 0 || (len === 1 && buffer[0] >= 1 && buffer[0] <= 16)) {
        throw new NonMinimalEncodingError();
      }
      chunk.buf = buffer;
    } else if (opcode === OP.PUSHDATA2) {
      const len = reader.readU16BE().n;
      if (len <= 0xff) {
        throw new NonMinimalEncodingError();
      }
      const buffer = reader.read(len);
      chunk.buf = buffer;
    } else if (opcode === OP.PUSHDATA4) {
      const len = reader.readU32BE().n;
      if (len <= 0xffff) {
        throw new NonMinimalEncodingError();
      }
      const buffer = reader.read(len);
      chunk.buf = buffer;
    }
    return chunk;
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
