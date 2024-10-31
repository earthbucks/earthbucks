import { describe, expect, test, beforeEach, it } from "vitest";
import { ScriptChunk } from "../src/script-chunk.js";
import { OP } from "../src/opcode.js";
import { BufWriter } from "@webbuf/rw";
import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

describe("ScriptChunk", () => {
  let scriptChunk: ScriptChunk;

  beforeEach(() => {
    scriptChunk = new ScriptChunk(0x4c, WebBuf.from([0, 1, 2, 3]));
  });

  test("should create a ScriptChunk", () => {
    expect(scriptChunk).toBeInstanceOf(ScriptChunk);
    expect(scriptChunk.opcode).toBe(0x4c);
    expect(scriptChunk.buf).toEqual(WebBuf.from([0, 1, 2, 3]));
  });

  describe("toString", () => {
    test("should create a ScriptChunk with opcode IF", () => {
      const scriptChunk = new ScriptChunk(OP.IF);
      expect(scriptChunk.toString()).toBe("IF");
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = WebBuf.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      expect(scriptChunk.toString()).toBe(`0x${"00".repeat(255)}`);
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = WebBuf.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      expect(scriptChunk.toString()).toBe(`0x${"00".repeat(256)}`);
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = WebBuf.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      expect(scriptChunk.toString()).toBe(`0x${"00".repeat(65536)}`);
    });
  });

  describe("fromString", () => {
    test("should create a ScriptChunk from opcode IF", () => {
      const scriptChunk = ScriptChunk.fromString("IF");
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA1 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromString(`0x${"00".repeat(255)}`);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(WebBuf.from(WebBuf.alloc(255).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA2 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromString(`0x${"00".repeat(256)}`);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(WebBuf.from(WebBuf.alloc(256).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA4 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromString(`0x${"00".repeat(65536)}`);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(WebBuf.from(WebBuf.alloc(65536).fill(0)));
    });

    test("should throw an error for invalid opcode", () => {
      expect(() => ScriptChunk.fromString("INVALID_OPCODE")).toThrow();
    });
  });

  describe("toBuf", () => {
    test("should convert a ScriptChunk with opcode IF to EbxBuf", () => {
      const scriptChunk = new ScriptChunk(OP.IF);
      expect(scriptChunk.toBuf()).toEqual(WebBuf.from([OP.IF]));
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA1 and a buffer to EbxBuf", () => {
      const buffer = WebBuf.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      const expected = WebBuf.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      expect(scriptChunk.toBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA2 and a buffer to EbxBuf", () => {
      const buffer = WebBuf.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      const expected = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA2))
        .writeU16BE(new U16BE(buffer.length))
        .write(buffer)
        .toBuf();
      expect(scriptChunk.toBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA4 and a buffer to EbxBuf", () => {
      const buffer = WebBuf.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      const expected = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA4))
        .writeU32BE(new U32BE(buffer.length))
        .write(buffer)
        .toBuf();
      expect(scriptChunk.toBuf()).toEqual(expected);
    });

    test("pushdata1", () => {
      const scriptChunk = ScriptChunk.fromString("0xff");
      const arr = scriptChunk.toBuf();
      expect(arr).toEqual(WebBuf.from([0x4c, 0x01, 0xff]));
    });
  });

  describe("fromBuf", () => {
    test("should create a ScriptChunk from EbxBuf with opcode IF", () => {
      const arr = WebBuf.from([OP.IF]);
      const scriptChunk = ScriptChunk.fromBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from EbxBuf with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = WebBuf.alloc(255).fill(0);
      const arr = WebBuf.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      const scriptChunk = ScriptChunk.fromBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(WebBuf.from(buffer));
    });

    test("should create a ScriptChunk from EbxBuf with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = WebBuf.alloc(256).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA2))
        .writeU16BE(new U16BE(buffer.length))
        .write(buffer)
        .toBuf();
      const scriptChunk = ScriptChunk.fromBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(WebBuf.from(buffer));
    });

    test("should create a ScriptChunk from EbxBuf with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = WebBuf.alloc(65536).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA4))
        .writeU32BE(new U32BE(buffer.length))
        .write(buffer)
        .toBuf();
      const scriptChunk = ScriptChunk.fromBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(WebBuf.from(buffer));
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = WebBuf.alloc(100).fill(0);
      const arr = WebBuf.from([OP.PUSHDATA1, 200, ...buffer]);
      expect(() => ScriptChunk.fromBuf(arr)).toThrow();
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = WebBuf.alloc(100).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA2))
        .writeU16BE(new U16BE(200))
        .write(buffer)
        .toBuf();
      expect(() => ScriptChunk.fromBuf(arr)).toThrow();
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = WebBuf.alloc(100).fill(0);
      const arr = new BufWriter()
        .writeU8(new U8(OP.PUSHDATA4))
        .writeU32BE(new U32BE(200))
        .write(buffer)
        .toBuf();
      expect(() => ScriptChunk.fromBuf(arr)).toThrow();
    });
  });

  describe("fromData", () => {
    test("should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = WebBuf.alloc(255).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(WebBuf.from(buffer));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = WebBuf.alloc(256).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(WebBuf.from(buffer));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = WebBuf.alloc(65536).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(WebBuf.from(buffer));
    });
  });
});
