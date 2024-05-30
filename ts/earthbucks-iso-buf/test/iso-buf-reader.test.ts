import { describe, expect, test, beforeEach } from "vitest";
import { Reader } from "../src/reader.js";
import { Buffer } from "buffer";
import { IsoBuf } from "../src/iso-buf.js";
import fs from "fs";
import path from "path";

describe("Reader", () => {
  let isoBufReader: Reader;
  let testBuffer: IsoBuf;

  beforeEach(() => {
    testBuffer = new IsoBuf(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
    isoBufReader = new Reader(testBuffer);
  });

  test("read returns correct subarray", () => {
    const len = 4;
    const result = isoBufReader.read(len).unwrap();
    expect(result).toEqual(testBuffer.subarray(0, len));
  });

  test("read updates position", () => {
    const len = 4;
    isoBufReader.read(len);
    expect(isoBufReader["pos"]).toBe(len);
  });

  test("readU8 returns correct value and updates position", () => {
    const result = isoBufReader.readU8().unwrap();
    expect(result).toBe(1);
    expect(isoBufReader["pos"]).toBe(1);
  });

  test("readU16BE returns correct value and updates position", () => {
    const result = isoBufReader.readU16BE().unwrap();
    expect(result).toBe(IsoBuf.from([1, 2]).unwrap().readU16BE(0).unwrap());
    expect(isoBufReader["pos"]).toBe(2);
  });

  test("readU32BE returns correct value and updates position", () => {
    const result = isoBufReader.readU32BE().unwrap();
    expect(result).toBe(
      IsoBuf.from([1, 2, 3, 4]).unwrap().readU32BE(0).unwrap(),
    );
    expect(isoBufReader["pos"]).toBe(4);
  });

  test("readU64BEBigInt returns correct value and updates position", () => {
    // Create a BufferReader with a buffer that contains the 64-bit unsigned integer 0x0123456789ABCDEF
    isoBufReader = new Reader(
      new IsoBuf(
        new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
      ),
    );

    const result = isoBufReader.readU64BE().unwrap();

    // Check that the method returns the correct BigInt
    expect(result).toEqual(BigInt("0x0123456789ABCDEF"));

    // Check that the position has been updated correctly
    expect(isoBufReader["pos"]).toBe(8);
  });

  test("readVarIntNum returns correct value and updates position for small numbers", () => {
    const result = isoBufReader.readVarIntNum().unwrap();
    expect(result).toBe(1); // Assuming that the implementation treats a single byte as a varint
    expect(isoBufReader["pos"]).toBe(1);
  });

  test("readVarIntNum returns correct value and updates position for 16 bit numbers", () => {
    const buf = IsoBuf.from([0xfd, 0, 0, 0, 0]).unwrap();
    buf.writeU16BE(500, 1);
    isoBufReader = new Reader(buf); // A varint that represents the number 2^30
    const result = isoBufReader.readVarIntNum().unwrap();
    expect(result).toBe(500); // 2^30
    expect(isoBufReader["pos"]).toBe(3);
  });

  test("readVarIntNum returns correct value and updates position for 32 bit numbers", () => {
    const buf = IsoBuf.from([254, 0, 0, 0, 0]).unwrap();
    buf.writeU32BE(2000000000, 1);
    isoBufReader = new Reader(buf); // A varint that represents the number 2^30
    const result = isoBufReader.readVarIntNum().unwrap();
    expect(result).toBe(2000000000); // 2^30
    expect(isoBufReader["pos"]).toBe(5);
  });

  test("readVarIntNum", () => {
    let bufferReader = new Reader(IsoBuf.from([0xfd, 0x00, 0x01]).unwrap());
    expect(bufferReader.readVarIntNum().val.toString()).toBe(
      "non-minimal encoding",
    );

    bufferReader = new Reader(
      IsoBuf.from([0xfe, 0x00, 0x00, 0x00, 0x01]).unwrap(),
    );
    expect(bufferReader.readVarIntNum().val.toString()).toBe(
      "non-minimal encoding",
    );

    bufferReader = new Reader(
      IsoBuf.from([
        0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
      ]).unwrap(),
    );
    expect(bufferReader.readVarIntNum().val.toString()).toBe(
      "non-minimal encoding",
    );

    bufferReader = new Reader(IsoBuf.from([0x01]).unwrap());
    expect(bufferReader.readVarIntNum().unwrap()).toBe(1);
  });

  test("readVarIntBuf", () => {
    let bufferReader = new Reader(IsoBuf.from([0xfd, 0x00, 0x01]).unwrap());
    expect(bufferReader.readVarIntBuf().val.toString()).toEqual(
      "non-minimal encoding",
    );

    bufferReader = new Reader(
      IsoBuf.from([0xfe, 0x00, 0x00, 0x00, 0x01]).unwrap(),
    );
    expect(bufferReader.readVarIntBuf().val.toString()).toEqual(
      "non-minimal encoding",
    );

    bufferReader = new Reader(
      IsoBuf.from([
        0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
      ]).unwrap(),
    );
    expect(bufferReader.readVarIntBuf().val.toString()).toEqual(
      "non-minimal encoding",
    );

    bufferReader = new Reader(IsoBuf.from([0x01]).unwrap());
    expect(bufferReader.readVarIntBuf().unwrap()).toEqual(
      IsoBuf.from([0x01]).unwrap(),
    );
  });

  test("readVarInt", () => {
    let bufferReader = new Reader(IsoBuf.from([0xfd, 0x00, 0x01]).unwrap());
    expect(bufferReader.readVarInt().val.toString()).toEqual(
      "non-minimal encoding",
    );

    bufferReader = new Reader(
      IsoBuf.from([0xfe, 0x00, 0x00, 0x00, 0x01]).unwrap(),
    );
    expect(bufferReader.readVarInt().val.toString()).toEqual(
      "non-minimal encoding",
    );

    bufferReader = new Reader(
      IsoBuf.from([
        0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
      ]).unwrap(),
    );
    expect(bufferReader.readVarInt().val.toString()).toEqual(
      "non-minimal encoding",
    );

    bufferReader = new Reader(IsoBuf.from([0x01]).unwrap());
    expect(bufferReader.readVarInt().unwrap()).toEqual(BigInt(1));
  });

  describe("test vectors", () => {
    interface TestVectorReader {
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

    const filePath = path.resolve(__dirname, "../test-vectors/reader.json");
    const jsonString = fs.readFileSync(filePath, "utf-8");
    const testVector: TestVectorReader = JSON.parse(jsonString);

    test("test vectors: read", () => {
      testVector.read.errors.forEach((test) => {
        const buf = IsoBuf.from(test.hex, "hex").unwrap();
        const bufferReader = new Reader(buf);
        expect(bufferReader.read(test.len).val.toString()).toEqual(test.error);
      });
    });

    test("test vectors: read_u8", () => {
      testVector.read_u8.errors.forEach((test) => {
        const buf = IsoBuf.from(test.hex, "hex").unwrap();
        const bufferReader = new Reader(buf);
        expect(
          bufferReader.readU8().val.toString().startsWith(test.error),
        ).toBeTruthy();
      });
    });

    test("test vectors: read_u16_be", () => {
      testVector.read_u16_be.errors.forEach((test) => {
        const buf = IsoBuf.from(test.hex, "hex").unwrap();
        const bufferReader = new Reader(buf);
        expect(
          bufferReader.readU16BE().val.toString().startsWith(test.error),
        ).toBeTruthy();
      });
    });

    test("test vectors: read_u32_be", () => {
      testVector.read_u32_be.errors.forEach((test) => {
        const buf = IsoBuf.from(test.hex, "hex").unwrap();
        const bufferReader = new Reader(buf);
        expect(
          bufferReader.readU32BE().val.toString().startsWith(test.error),
        ).toBeTruthy();
      });
    });

    test("test vectors: read_u64_be", () => {
      testVector.read_u64_be.errors.forEach((test) => {
        const buf = IsoBuf.from(test.hex, "hex").unwrap();
        const bufferReader = new Reader(buf);
        expect(
          bufferReader.readU64BE().val.toString().startsWith(test.error),
        ).toBeTruthy();
      });
    });

    test("test vectors: read_var_int_buf", () => {
      testVector.read_var_int_buf.errors.forEach((test) => {
        const buf = IsoBuf.from(test.hex, "hex").unwrap();
        const bufferReader = new Reader(buf);
        expect(bufferReader.readVarIntBuf().val.toString()).toMatch(
          new RegExp("^" + test.error.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
      });
    });

    test("test vectors: read_var_int", () => {
      testVector.read_var_int.errors.forEach((test) => {
        const buf = IsoBuf.from(test.hex, "hex").unwrap();
        const bufferReader = new Reader(buf);
        expect(bufferReader.readVarInt().val.toString()).toMatch(
          new RegExp("^" + test.error.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
      });
    });
  });
});
