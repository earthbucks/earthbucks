import { describe, expect, test, beforeEach } from "vitest";
import { BufReader } from "../src/buf-reader.js";
import { SysBuf } from "../src/buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";
import fs from "node:fs";
import path from "node:path";

describe("BufReader", () => {
  let bufferReader: BufReader;
  let testEbxBuf: SysBuf;

  beforeEach(() => {
    testEbxBuf = SysBuf.from([1, 2, 3, 4, 5, 6, 7, 8]);
    bufferReader = new BufReader(testEbxBuf);
  });

  test("constructor sets buffer and position", () => {
    expect(bufferReader.buf).toEqual(
      SysBuf.from(
        testEbxBuf.buffer,
        testEbxBuf.byteOffset,
        testEbxBuf.byteLength,
      ),
    );
    expect(bufferReader.pos).toBe(0);
  });

  test("read returns correct subarray", () => {
    const len = 4;
    const result = bufferReader.read(len);
    expect(result).toEqual(testEbxBuf.subarray(0, len));
  });

  test("read updates position", () => {
    const len = 4;
    bufferReader.read(len);
    expect(bufferReader.pos).toBe(len);
  });

  test("readUInt8 returns correct value and updates position", () => {
    const result = bufferReader.readU8();
    expect(result.n).toBe(1);
    expect(bufferReader.pos).toBe(1);
  });

  test("readUInt16BE returns correct value and updates position", () => {
    const result = bufferReader.readU16BE();
    expect(result.n).toBe(SysBuf.from([1, 2]).readUInt16BE());
    expect(bufferReader.pos).toBe(2);
  });

  test("readUInt32BE returns correct value and updates position", () => {
    const result = bufferReader.readU32BE();
    expect(result.n).toBe(SysBuf.from([1, 2, 3, 4]).readUInt32BE());
    expect(bufferReader.pos).toBe(4);
  });

  test("readUInt64BEBigInt returns correct value and updates position", () => {
    // Create a EbxBufReader with a buffer that contains the 64-bit unsigned integer 0x0123456789ABCDEF
    bufferReader = new BufReader(
      SysBuf.from([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
    );

    const result = bufferReader.readU64BE();

    // Check that the method returns the correct BigInt
    expect(result.bn).toEqual(BigInt("0x0123456789ABCDEF"));

    // Check that the position has been updated correctly
    expect(bufferReader.pos).toBe(8);
  });

  test("readVarIntBuf", () => {
    let bufferReader = new BufReader(SysBuf.from([0xfd, 0x00, 0x01]));
    expect(() => bufferReader.readVarIntBuf()).toThrow();

    bufferReader = new BufReader(SysBuf.from([0xfe, 0x00, 0x00, 0x00, 0x01]));
    expect(() => bufferReader.readVarIntBuf()).toThrow();

    bufferReader = new BufReader(
      SysBuf.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(() => bufferReader.readVarIntBuf()).toThrow();

    bufferReader = new BufReader(SysBuf.from([0x01]));
    expect(bufferReader.readVarIntBuf().toString("hex")).toEqual(
      SysBuf.from([0x01]).toString("hex"),
    );
  });

  test("readVarInt", () => {
    let bufferReader = new BufReader(SysBuf.from([0xfd, 0x00, 0x01]));
    expect(() => bufferReader.readVarInt()).toThrow();

    bufferReader = new BufReader(SysBuf.from([0xfe, 0x00, 0x00, 0x00, 0x01]));
    expect(() => bufferReader.readVarInt()).toThrow();

    bufferReader = new BufReader(
      SysBuf.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(() => bufferReader.readVarInt()).toThrow();

    bufferReader = new BufReader(SysBuf.from([0x01]));
    expect(bufferReader.readVarInt().bn).toEqual(BigInt(1));
  });

  describe("test vectors", () => {
    interface TestVectorEbxBufReader {
      read: TestVectorReadEbxBuf;
      read_u8: TestVectorReadErrors;
      read_u16_be: TestVectorReadErrors;
      read_u32_be: TestVectorReadErrors;
      read_u64_be: TestVectorReadErrors;
      read_var_int_buf: TestVectorReadErrors;
      read_var_int: TestVectorReadErrors;
    }

    interface TestVectorReadEbxBuf {
      errors: TestVectorReadEbxBufError[];
    }

    interface TestVectorReadEbxBufError {
      hex: string;
      len: number;
      error: string;
    }

    interface TestVectorReadErrors {
      errors: TestVectorReadError[];
    }

    interface TestVectorReadError {
      hex: string;
      error: string;
    }

    const filePath = path.resolve(__dirname, "../test-vectors/buf_reader.json");
    const jsonString = fs.readFileSync(filePath, "utf-8");
    const testVector: TestVectorEbxBufReader = JSON.parse(jsonString);

    test("test vectors: read", () => {
      for (const test of testVector.read.errors) {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new BufReader(buf);
        expect(() => bufferReader.read(test.len)).toThrow();
      }
    });

    test("test vectors: read_u8", () => {
      for (const test of testVector.read_u8.errors) {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new BufReader(buf);
        expect(() => bufferReader.readU8()).toThrow();
      }
    });

    test("test vectors: read_u16_be", () => {
      for (const test of testVector.read_u16_be.errors) {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new BufReader(buf);
        expect(() => bufferReader.readU16BE()).toThrow();
      }
    });

    test("test vectors: read_u32_be", () => {
      for (const test of testVector.read_u32_be.errors) {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new BufReader(buf);
        expect(() => bufferReader.readU32BE()).toThrow();
      }
    });

    test("test vectors: read_u64_be", () => {
      for (const test of testVector.read_u64_be.errors) {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new BufReader(buf);
        expect(() => bufferReader.readU64BE()).toThrow();
      }
    });

    test("test vectors: read_var_int_buf", () => {
      for (const test of testVector.read_var_int_buf.errors) {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new BufReader(buf);
        expect(() => bufferReader.readVarIntBuf()).toThrow();
      }
    });

    test("test vectors: read_var_int", () => {
      for (const test of testVector.read_var_int.errors) {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new BufReader(buf);
        expect(() => bufferReader.readVarInt()).toThrow();
      }
    });
  });
});
