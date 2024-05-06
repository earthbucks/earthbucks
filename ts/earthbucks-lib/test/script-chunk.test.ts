import { describe, expect, test, beforeEach, it } from "@jest/globals";
import ScriptChunk from "../src/script-chunk";
import { OP } from "../src/opcode";
import IsoBufWriter from "../src/iso-buf-writer";
import { Buffer } from "buffer";

describe("ScriptChunk", () => {
  let scriptChunk: ScriptChunk;

  beforeEach(() => {
    scriptChunk = new ScriptChunk(0x4c, Buffer.from([0, 1, 2, 3]));
  });

  test("should create a ScriptChunk", () => {
    expect(scriptChunk).toBeInstanceOf(ScriptChunk);
    expect(scriptChunk.opcode).toBe(0x4c);
    expect(scriptChunk.buf).toEqual(Buffer.from([0, 1, 2, 3]));
  });

  describe("toString", () => {
    test("should create a ScriptChunk with opcode IF", () => {
      const scriptChunk = new ScriptChunk(OP.IF);
      expect(scriptChunk.toString()).toBe("IF");
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = Buffer.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      expect(scriptChunk.toString()).toBe("0x" + "00".repeat(255));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = Buffer.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      expect(scriptChunk.toString()).toBe("0x" + "00".repeat(256));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = Buffer.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      expect(scriptChunk.toString()).toBe("0x" + "00".repeat(65536));
    });
  });

  describe("fromString", () => {
    test("should create a ScriptChunk from opcode IF", () => {
      const scriptChunk = ScriptChunk.fromString("IF");
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA1 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromString("0x" + "00".repeat(255));
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(Buffer.from(Buffer.alloc(255).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA2 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromString("0x" + "00".repeat(256));
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(Buffer.from(Buffer.alloc(256).fill(0)));
    });

    test("should create a ScriptChunk from opcode OP_PUSHDATA4 and a buffer", () => {
      const scriptChunk = ScriptChunk.fromString("0x" + "00".repeat(65536));
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(Buffer.from(Buffer.alloc(65536).fill(0)));
    });

    test("should throw an error for invalid opcode", () => {
      expect(() => ScriptChunk.fromString("INVALID_OPCODE")).toThrow(
        "invalid opcode",
      );
    });
  });

  describe("toIsoBuf", () => {
    test("should convert a ScriptChunk with opcode IF to Buffer", () => {
      const scriptChunk = new ScriptChunk(OP.IF);
      expect(scriptChunk.toIsoBuf()).toEqual(Buffer.from([OP.IF]));
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA1 and a buffer to Buffer", () => {
      const buffer = Buffer.alloc(255).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA1, buffer);
      const expected = Buffer.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      expect(scriptChunk.toIsoBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA2 and a buffer to Buffer", () => {
      const buffer = Buffer.alloc(256).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA2, buffer);
      const expected = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(buffer.length)
        .writeBuffer(buffer)
        .toIsoBuf();
      expect(scriptChunk.toIsoBuf()).toEqual(expected);
    });

    test("should convert a ScriptChunk with opcode OP_PUSHDATA4 and a buffer to Buffer", () => {
      const buffer = Buffer.alloc(65536).fill(0);
      const scriptChunk = new ScriptChunk(OP.PUSHDATA4, buffer);
      const expected = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(buffer.length)
        .writeBuffer(buffer)
        .toIsoBuf();
      expect(scriptChunk.toIsoBuf()).toEqual(expected);
    });

    test("pushdata1", () => {
      const scriptChunk = new ScriptChunk().fromString("0xff");
      const arr = scriptChunk.toIsoBuf();
      expect(arr).toEqual(Buffer.from([0x4c, 0x01, 0xff]));
    });
  });

  describe("fromU8Vec", () => {
    test("should create a ScriptChunk from Buffer with opcode IF", () => {
      const arr = Buffer.from([OP.IF]);
      const scriptChunk = new ScriptChunk().fromIsoBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.IF);
      expect(scriptChunk.buf).toBeUndefined();
    });

    test("should create a ScriptChunk from Buffer with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = Buffer.alloc(255).fill(0);
      const arr = Buffer.from([OP.PUSHDATA1, buffer.length, ...buffer]);
      const scriptChunk = new ScriptChunk().fromIsoBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(Buffer.from(buffer));
    });

    test("should create a ScriptChunk from Buffer with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = Buffer.alloc(256).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(buffer.length)
        .writeBuffer(buffer)
        .toIsoBuf();
      const scriptChunk = new ScriptChunk().fromIsoBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(Buffer.from(buffer));
    });

    test("should create a ScriptChunk from Buffer with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = Buffer.alloc(65536).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(buffer.length)
        .writeBuffer(buffer)
        .toIsoBuf();
      const scriptChunk = new ScriptChunk().fromIsoBuf(arr);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(Buffer.from(buffer));
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = Buffer.alloc(100).fill(0);
      const arr = Buffer.from([OP.PUSHDATA1, 200, ...buffer]);
      expect(() => new ScriptChunk().fromIsoBuf(arr)).toThrow(
        "Buffer length is other than expected",
      );
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = Buffer.alloc(100).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA2)
        .writeUInt16BE(200)
        .writeBuffer(buffer)
        .toIsoBuf();
      expect(() => new ScriptChunk().fromIsoBuf(arr)).toThrow(
        "Buffer length is other than expected",
      );
    });

    test("should throw error if length does not match expected length", () => {
      const buffer = Buffer.alloc(100).fill(0);
      const arr = new IsoBufWriter()
        .writeUInt8(OP.PUSHDATA4)
        .writeUInt32BE(200)
        .writeBuffer(buffer)
        .toIsoBuf();
      expect(() => new ScriptChunk().fromIsoBuf(arr)).toThrow(
        "Buffer length is other than expected",
      );
    });
  });

  describe("fromData", () => {
    test("should create a ScriptChunk with opcode OP_PUSHDATA1 and a buffer", () => {
      const buffer = Buffer.alloc(255).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA1);
      expect(scriptChunk.buf).toEqual(Buffer.from(buffer));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA2 and a buffer", () => {
      const buffer = Buffer.alloc(256).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA2);
      expect(scriptChunk.buf).toEqual(Buffer.from(buffer));
    });

    test("should create a ScriptChunk with opcode OP_PUSHDATA4 and a buffer", () => {
      const buffer = Buffer.alloc(65536).fill(0);
      const scriptChunk = ScriptChunk.fromData(buffer);
      expect(scriptChunk.opcode).toBe(OP.PUSHDATA4);
      expect(scriptChunk.buf).toEqual(Buffer.from(buffer));
    });
  });
});
