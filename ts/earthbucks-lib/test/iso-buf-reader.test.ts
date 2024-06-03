import { describe, expect, test, beforeEach } from "vitest";
import { IsoBufReader } from "../src/iso-buf-reader.js";
import { SysBuf } from "../src/iso-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";
import fs from "fs";
import path from "path";
import {
  EbxError,
  GenericError,
  NonMinimalEncodingError,
  NotEnoughDataError,
} from "../src/ebx-error.js";

describe("IsoBufReader", () => {
  let bufferReader: IsoBufReader;
  let testIsoBuf: SysBuf;

  beforeEach(() => {
    testIsoBuf = SysBuf.from([1, 2, 3, 4, 5, 6, 7, 8]);
    bufferReader = new IsoBufReader(testIsoBuf);
  });

  test("constructor sets buffer and position", () => {
    expect(bufferReader["buf"]).toEqual(
      SysBuf.from(
        testIsoBuf.buffer,
        testIsoBuf.byteOffset,
        testIsoBuf.byteLength,
      ),
    );
    expect(bufferReader["pos"]).toBe(0);
  });

  test("read returns correct subarray", () => {
    const len = 4;
    const result = bufferReader.read(len);
    expect(result).toEqual(testIsoBuf.subarray(0, len));
  });

  test("read updates position", () => {
    const len = 4;
    bufferReader.read(len);
    expect(bufferReader["pos"]).toBe(len);
  });

  test("readUInt8 returns correct value and updates position", () => {
    const result = bufferReader.readU8();
    expect(result.n).toBe(1);
    expect(bufferReader["pos"]).toBe(1);
  });

  test("readUInt16BE returns correct value and updates position", () => {
    const result = bufferReader.readU16BE();
    expect(result.n).toBe(SysBuf.from([1, 2]).readUInt16BE());
    expect(bufferReader["pos"]).toBe(2);
  });

  test("readUInt32BE returns correct value and updates position", () => {
    const result = bufferReader.readU32BE();
    expect(result.n).toBe(SysBuf.from([1, 2, 3, 4]).readUInt32BE());
    expect(bufferReader["pos"]).toBe(4);
  });

  test("readUInt64BEBigInt returns correct value and updates position", () => {
    // Create a IsoBufReader with a buffer that contains the 64-bit unsigned integer 0x0123456789ABCDEF
    bufferReader = new IsoBufReader(
      SysBuf.from([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
    );

    const result = bufferReader.readU64BE();

    // Check that the method returns the correct BigInt
    expect(result.bn).toEqual(BigInt("0x0123456789ABCDEF"));

    // Check that the position has been updated correctly
    expect(bufferReader["pos"]).toBe(8);
  });

  test("readVarIntBuf", () => {
    let bufferReader = new IsoBufReader(SysBuf.from([0xfd, 0x00, 0x01]));
    expect(() => bufferReader.readVarIntBuf()).toThrow(NonMinimalEncodingError);

    bufferReader = new IsoBufReader(
      SysBuf.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(() => bufferReader.readVarIntBuf()).toThrow(NonMinimalEncodingError);

    bufferReader = new IsoBufReader(
      SysBuf.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(() => bufferReader.readVarIntBuf()).toThrow(NonMinimalEncodingError);

    bufferReader = new IsoBufReader(SysBuf.from([0x01]));
    expect(bufferReader.readVarIntBuf().toString("hex")).toEqual(
      SysBuf.from([0x01]).toString("hex"),
    );
  });

  test("readVarInt", () => {
    let bufferReader = new IsoBufReader(SysBuf.from([0xfd, 0x00, 0x01]));
    expect(() => bufferReader.readVarInt()).toThrow(NonMinimalEncodingError);

    bufferReader = new IsoBufReader(
      SysBuf.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(() => bufferReader.readVarInt()).toThrow(NonMinimalEncodingError);

    bufferReader = new IsoBufReader(
      SysBuf.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(() => bufferReader.readVarInt()).toThrow(NonMinimalEncodingError);

    bufferReader = new IsoBufReader(SysBuf.from([0x01]));
    expect(bufferReader.readVarInt().bn).toEqual(BigInt(1));
  });

  describe("test vectors", () => {
    interface TestVectorIsoBufReader {
      read: TestVectorReadIsoBuf;
      read_u8: TestVectorReadErrors;
      read_u16_be: TestVectorReadErrors;
      read_u32_be: TestVectorReadErrors;
      read_u64_be: TestVectorReadErrors;
      read_var_int_buf: TestVectorReadErrors;
      read_var_int: TestVectorReadErrors;
    }

    interface TestVectorReadIsoBuf {
      errors: TestVectorReadIsoBufError[];
    }

    interface TestVectorReadIsoBufError {
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

    const filePath = path.resolve(
      __dirname,
      "../test-vectors/iso_buf_reader.json",
    );
    const jsonString = fs.readFileSync(filePath, "utf-8");
    const testVector: TestVectorIsoBufReader = JSON.parse(jsonString);

    test("test vectors: read", () => {
      testVector.read.errors.forEach((test) => {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        console.log(test.error);
        expect(() => bufferReader.read(test.len)).toThrow(errorType);
      });
    });

    test("test vectors: read_u8", () => {
      testVector.read_u8.errors.forEach((test) => {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        expect(() => bufferReader.readU8()).toThrow(errorType);
      });
    });

    test("test vectors: read_u16_be", () => {
      testVector.read_u16_be.errors.forEach((test) => {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        expect(() => bufferReader.readU16BE()).toThrow(errorType);
      });
    });

    test("test vectors: read_u32_be", () => {
      testVector.read_u32_be.errors.forEach((test) => {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        expect(() => bufferReader.readU32BE()).toThrow(errorType);
      });
    });

    test("test vectors: read_u64_be", () => {
      testVector.read_u64_be.errors.forEach((test) => {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        expect(() => bufferReader.readU64BE()).toThrow(errorType);
      });
    });

    test("test vectors: read_var_int_buf", () => {
      testVector.read_var_int_buf.errors.forEach((test) => {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        expect(() => bufferReader.readVarIntBuf()).toThrow(errorType);
      });
    });

    test("test vectors: read_var_int", () => {
      testVector.read_var_int.errors.forEach((test) => {
        const buf = SysBuf.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        expect(() => bufferReader.readVarInt()).toThrow(errorType);
      });
    });
  });
});
