import { describe, expect, test, beforeEach, it } from "vitest";
import { ScriptChunk } from "../src/script-chunk.js";
import { OP } from "../src/opcode.js";
import { IsoBufWriter } from "../src/iso-buf-writer.js";
import { SysBuf } from "../src/iso-buf.js";

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
      expect(scriptChunk.toIsoStr().unwrap()).toBe("IF");
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = SysBuf.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      expect(scriptChunk.toIsoStr().unwrap()).toBe("0x" + "00".repeat(255));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = SysBuf.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      expect(scriptChunk.toIsoStr().unwrap()).toBe("0x" + "00".repeat(256));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = SysBuf.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      expect(scriptChunk.toIsoStr().unwrap()).toBe("0x" + "00".repeat(65536));
    });
  });

  describe("fromIsoStr", () => {
    test("should create a ScriptChunk from opcode IF", () => {
      const scriptChunk = ScriptChunk.fromIsoStr("IF").unwrap();
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA1 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromIsoStr(
        "0x" + "00".repeat(255),
      ).unwrap();
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(SysBuf.from(SysBuf.alloc(255).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA2 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromIsoStr(
        "0x" + "00".repeat(256),
      ).unwrap();
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(SysBuf.from(SysBuf.alloc(256).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA4 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromIsoStr(
        "0x" + "00".repeat(65536),
      ).unwrap();
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(SysBuf.from(SysBuf.alloc(65536).fill(0)));
    });

    test("should throw an error for invalid opcode", () => {
      const res = ScriptChunk.fromIsoStr("INVALID_OPCODE");
      expect(res.err).toBeTruthy();
      expect(res.val.toString()).toEqual("invalid opcode");
    });
  });

  describe("toIsoBuf", () => {
    test("should convert a ScriptChunk with opcode IF to IsoBuf", () => {
      const scriptChunk = new ScriptChunk(OP.IF);
      expect(scriptChunk.toIsoBuf()).toEqual(SysBuf.from([OP.IF]));
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA1 and a buffer to IsoBuf", () => {
      const buffer = SysBuf.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      const expected = SysBuf.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      expect(scriptChunk.toIsoBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA2 and a buffer to IsoBuf", () => {
      const buffer = SysBuf.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      const expected = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(buffer.length)
        .write(buffer)
        .toIsoBuf();
      expect(scriptChunk.toIsoBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA4 and a buffer to IsoBuf", () => {
      const buffer = SysBuf.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      const expected = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(buffer.length)
        .write(buffer)
        .toIsoBuf();
      expect(scriptChunk.toIsoBuf()).toEqual(expected);
    });

    test("pushdata1", () => {
      const scriptChunk = ScriptChunk.fromIsoStr("0xff").unwrap();
      const arr = scriptChunk.toIsoBuf();
      expect(arr).toEqual(SysBuf.from([0x4c, 0x01, 0xff]));
    });
  });

  describe("fromIsoBuf", () => {
    test("should create a ScriptChunk from IsoBuf with opcode IF", () => {
      const arr = SysBuf.from([OP.IF]);
      const scriptChunk = ScriptChunk.fromIsoBuf(arr).unwrap();
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from IsoBuf with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = SysBuf.alloc(255).fill(0);
      const arr = SysBuf.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      const scriptChunk = ScriptChunk.fromIsoBuf(arr).unwrap();
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should create a ScriptChunk from IsoBuf with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = SysBuf.alloc(256).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(buffer.length)
        .write(buffer)
        .toIsoBuf();
      const scriptChunk = ScriptChunk.fromIsoBuf(arr).unwrap();
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should create a ScriptChunk from IsoBuf with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = SysBuf.alloc(65536).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(buffer.length)
        .write(buffer)
        .toIsoBuf();
      const scriptChunk = ScriptChunk.fromIsoBuf(arr).unwrap();
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(SysBuf.from(buffer));
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = SysBuf.alloc(100).fill(0);
      const arr = SysBuf.from([OP.PUSHDATA1, 200, ...buffer]);
      const res = ScriptChunk.fromIsoBuf(arr);
      expect(res.err).toBeTruthy();
      expect(res.val.toString()).toEqual(
        "not enough bytes in the buffer to read",
      );
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = SysBuf.alloc(100).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(200)
        .write(buffer)
        .toIsoBuf();
      const res = ScriptChunk.fromIsoBuf(arr);
      expect(res.err).toBeTruthy();
      expect(res.val.toString()).toEqual("non-minimal encoding");
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = SysBuf.alloc(100).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(200)
        .write(buffer)
        .toIsoBuf();
      const res = ScriptChunk.fromIsoBuf(arr);
      expect(res.err).toBeTruthy();
      expect(res.val.toString()).toEqual("non-minimal encoding");
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
