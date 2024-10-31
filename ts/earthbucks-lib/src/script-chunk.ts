import { OPCODE_TO_NAME, OP, Opcode } from "./opcode.js";
import type { OpcodeName } from "./opcode.js";
import { BufWriter } from "@webbuf/rw";
import { BufReader } from "@webbuf/rw";
import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

export class ScriptChunk {
  opcode: number;
  buf?: WebBuf;

  constructor(opcode = 0, buf?: WebBuf) {
    this.opcode = opcode;
    this.buf = buf;
  }

  getData(): WebBuf {
    if (this.opcode === Opcode.OP_1NEGATE) {
      return WebBuf.from([0x80]);
    }
    if (this.opcode === Opcode.OP_0) {
      return WebBuf.from([]);
    }
    if (this.opcode >= Opcode.OP_1 && this.opcode <= Opcode.OP_16) {
      return WebBuf.from([this.opcode - Opcode.OP_1 + 1]);
    }
    if (this.buf) {
      return this.buf;
    }
    throw new Error("not enough bytes in the buffer to read");
  }

  toString(): string {
    if (this.buf) {
      return `0x${this.buf.toString("hex")}`;
    }
    const name = OPCODE_TO_NAME[this.opcode];
    if (name !== undefined) {
      return name;
    }
    throw new Error("invalid opcode");
  }

  static fromString(str: string): ScriptChunk {
    const scriptChunk = new ScriptChunk();
    if (str.startsWith("0x")) {
      scriptChunk.buf = WebBuf.from(str.slice(2), "hex");
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
        throw new Error("too many bytes in the buffer to read");
      }
    } else {
      function isOpcodeName(str: string): str is OpcodeName {
        return Object.prototype.hasOwnProperty.call(OP, str);
      }
      if (isOpcodeName(str)) {
        const opcode = OP[str];
        scriptChunk.opcode = opcode;
      } else {
        throw new Error("invalid opcode");
      }

      scriptChunk.buf = undefined;
    }
    return scriptChunk;
  }

  toBuf(): WebBuf {
    const opcode = this.opcode;
    if (opcode === OP.PUSHDATA1 && this.buf) {
      return WebBuf.concat([
        WebBuf.from([opcode]),
        new BufWriter().writeU8(new U8(this.buf.length)).toBuf(),
        this.buf,
      ]);
    }
    if (opcode === OP.PUSHDATA2 && this.buf) {
      return WebBuf.concat([
        WebBuf.from([opcode]),
        new BufWriter().writeU16BE(new U16BE(this.buf.length)).toBuf(),
        this.buf,
      ]);
    }
    if (opcode === OP.PUSHDATA4 && this.buf) {
      return WebBuf.concat([
        WebBuf.from([opcode]),
        new BufWriter().writeU32BE(new U32BE(this.buf.length)).toBuf(),
        this.buf,
      ]);
    }
    return WebBuf.from([opcode]);
  }

  static fromBuf(buf: WebBuf): ScriptChunk {
    const reader = new BufReader(buf);
    return ScriptChunk.fromBufReader(reader);
  }

  static fromBufReader(reader: BufReader): ScriptChunk {
    const opcode = reader.readU8().n;
    const chunk = new ScriptChunk(opcode);
    if (opcode === OP.PUSHDATA1) {
      const len = reader.readU8().n;
      const buffer = reader.read(len);
      const first = buffer[0];
      if (len === 0 || (len === 1 && first && first >= 1 && first <= 16)) {
        throw new Error("non-minimal encoding");
      }
      chunk.buf = buffer;
    } else if (opcode === OP.PUSHDATA2) {
      const len = reader.readU16BE().n;
      if (len <= 0xff) {
        throw new Error("non-minimal encoding");
      }
      const buffer = reader.read(len);
      chunk.buf = buffer;
    } else if (opcode === OP.PUSHDATA4) {
      const len = reader.readU32BE().n;
      if (len <= 0xffff) {
        throw new Error("non-minimal encoding");
      }
      const buffer = reader.read(len);
      chunk.buf = buffer;
    }
    return chunk;
  }

  static fromData(data: WebBuf): ScriptChunk {
    const len = data.length;
    if (len === 0) {
      return new ScriptChunk(Opcode.OP_0);
    }
    const first = data[0];
    if (len === 1 && first && first >= 1 && first <= 16) {
      return new ScriptChunk(first + Opcode.OP_1 - 1);
    }
    if (len <= 0xff) {
      return new ScriptChunk(Opcode.OP_PUSHDATA1, data);
    }
    if (len <= 0xffff) {
      return new ScriptChunk(Opcode.OP_PUSHDATA2, data);
    }
    if (len <= 0xffffffff) {
      return new ScriptChunk(Opcode.OP_PUSHDATA4, data);
    }
    return new ScriptChunk(0);
  }

  static fromSmallNumber(n: number): ScriptChunk {
    if (n === -1 || (n >= 1 && n <= 16)) {
      return new ScriptChunk(n + Opcode.OP_1 - 1);
    }
    return new ScriptChunk(0);
  }

  clone(): ScriptChunk {
    return new ScriptChunk(
      this.opcode,
      this.buf ? WebBuf.from(this.buf) : undefined,
    );
  }
}
