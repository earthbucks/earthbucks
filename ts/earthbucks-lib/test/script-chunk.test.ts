import { describe, expect, test, beforeEach, it } from "vitest";
import { ScriptChunk } from "../src/script-chunk.js";
import { OP } from "../src/opcode.js";
import { BufWriter } from "../src/buf-writer.js";
import { SysBuf } from "../src/ebx-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";
import {
  InvalidOpcodeError,
  NonMinimalEncodingError,
  NotEnoughDataError,
} from "../src/ebx-error.js";

describe("ScriptChunk", () => {
  let scriptChunk: ScriptChunk;

  beforeEach(() => {
    scriptChunk = new ScriptChunk(0x4c, SysBuf.from([0, 1, 2, 3]));
  });

  test("should create a ScriptChunk", () => {
    expect(scriptChunk).toBeInstanceOf(ScriptChunk);
    expect(scriptChunk.opcode).toBe(0x4c);
    expect(scriptChunk.buf).toEqual(SysBuf.from([0, 1, 2, 3]));
  });

  describe("toString", () => {
    test("should create a ScriptChunk with opcode IF", () => {
      const scriptChunk = new ScriptChunk(OP.IF);
      expect(scriptChunk.toIsoStr()).toBe("IF");
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = SysBuf.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      expect(scriptChunk.toIsoStr()).toBe("0x" + "00".repeat(255));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = SysBuf.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      expect(scriptChunk.toIsoStr()).toBe("0x" + "00".repeat(256));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = SysBuf.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      expect(scriptChunk.toIsoStr()).toBe("0x" + "00".repeat(65536));
    });
  });

  describe("fromIsoStr", () => {
    test("should create a ScriptChunk from opcode IF", () => {
      const scriptChunk = ScriptChunk.fromIsoStr("IF");
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA1 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromIsoStr("0x" + "00".repeat(255));
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(SysBuf.from(SysBuf.alloc(255).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA2 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromIsoStr("0x" + "00".repeat(256));
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(SysBuf.from(SysBuf.alloc(256).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA4 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromIsoStr("0x" + "00".repeat(65536));
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(SysBuf.from(SysBuf.alloc(65536).fill(0)));
    });

    test("should throw an error for invalid opcode", () => {
      expect(() => ScriptChunk.fromIsoStr("INVALID_OPCODE")).toThrow(
        InvalidOpcodeError,
      );
    });
  });

  describe("toEbxBuf", () => {
    test("should convert a ScriptChunk with opcode IF to EbxBuf", () => {
      const scriptChunk = new ScriptChunk(OP.IF);
      expect(scriptChunk.toEbxBuf()).toEqual(SysBuf.from([OP.IF]));
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA1 and a buffer to EbxBuf", () => {
      const buffer = SysBuf.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      const expected = SysBuf.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      expect(scriptChunk.toEbxBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA2 and a buffer to EbxBuf", () => {
      const buffer = SysBuf.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      const expected = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA2))
        .writeU16BE(new U16(buffer.length))
        .write(buffer)
        .toBuf();
      expect(scriptChunk.toEbxBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA4 and a buffer to EbxBuf", () => {
      const buffer = SysBuf.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      const expected = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA4))
        .writeU32BE(new U32(buffer.length))
        .write(buffer)
        .toBuf();
      expect(scriptChunk.toEbxBuf()).toEqual(expected);
    });

    test("pushdata1", () => {
      const scriptChunk = ScriptChunk.fromIsoStr("0xff");
      const arr = scriptChunk.toEbxBuf();
      expect(arr).toEqual(SysBuf.from([0x4c, 0x01, 0xff]));
    });
  });

  describe("fromEbxBuf", () => {
    test("should create a ScriptChunk from EbxBuf with opcode IF", () => {
      const arr = SysBuf.from([OP.IF]);
      const scriptChunk = ScriptChunk.fromEbxBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from EbxBuf with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = SysBuf.alloc(255).fill(0);
      const arr = SysBuf.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      const scriptChunk = ScriptChunk.fromEbxBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should create a ScriptChunk from EbxBuf with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = SysBuf.alloc(256).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA2))
        .writeU16BE(new U16(buffer.length))
        .write(buffer)
        .toBuf();
      const scriptChunk = ScriptChunk.fromEbxBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should create a ScriptChunk from EbxBuf with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = SysBuf.alloc(65536).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA4))
        .writeU32BE(new U32(buffer.length))
        .write(buffer)
        .toBuf();
      const scriptChunk = ScriptChunk.fromEbxBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = SysBuf.alloc(100).fill(0);
      const arr = SysBuf.from([OP.PUSHDATA1, 200, ...buffer]);
      expect(() => ScriptChunk.fromEbxBuf(arr)).toThrow(NotEnoughDataError);
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = SysBuf.alloc(100).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA2))
        .writeU16BE(new U16(200))
        .write(buffer)
        .toBuf();
      expect(() => ScriptChunk.fromEbxBuf(arr)).toThrow(
        NonMinimalEncodingError,
      );
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = SysBuf.alloc(100).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA4))
        .writeU32BE(new U32(200))
        .write(buffer)
        .toBuf();
      expect(() => ScriptChunk.fromEbxBuf(arr)).toThrow(
        NonMinimalEncodingError,
      );
    });
  });

  describe("fromData", () => {
    test("should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = SysBuf.alloc(255).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = SysBuf.alloc(256).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = SysBuf.alloc(65536).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });
  });
});
