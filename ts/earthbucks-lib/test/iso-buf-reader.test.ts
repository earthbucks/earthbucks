import { describe, expect, test, beforeEach } from "@jest/globals";
import IsoBufReader from "../src/iso-buf-reader";
import { Buffer } from "buffer";
import fs from "fs";
import path from "path";

describe("BufferReader", () => {
  let bufferReader: IsoBufReader;
  let testBuffer: Buffer;

  beforeEach(() => {
    testBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
    bufferReader = new IsoBufReader(testBuffer);
  });

  test("constructor sets buffer and position", () => {
    expect(bufferReader["buf"]).toEqual(
      Buffer.from(
        testBuffer.buffer,
        testBuffer.byteOffset,
        testBuffer.byteLength,
      ),
    );
    expect(bufferReader["pos"]).toBe(0);
  });

  test("read returns correct subarray", () => {
    const len = 4;
    const result = bufferReader.readIsoBuf(len).unwrap();
    expect(result).toEqual(testBuffer.subarray(0, len));
  });

  test("read updates position", () => {
    const len = 4;
    bufferReader.readIsoBuf(len);
    expect(bufferReader["pos"]).toBe(len);
  });

  test("readUInt8 returns correct value and updates position", () => {
    const result = bufferReader.readU8().unwrap();
    expect(result).toBe(1);
    expect(bufferReader["pos"]).toBe(1);
  });

  test("readUInt16BE returns correct value and updates position", () => {
    const result = bufferReader.readU16BE().unwrap();
    expect(result).toBe(Buffer.from([1, 2]).readUInt16BE());
    expect(bufferReader["pos"]).toBe(2);
  });

  test("readUInt32BE returns correct value and updates position", () => {
    const result = bufferReader.readU32BE().unwrap();
    expect(result).toBe(Buffer.from([1, 2, 3, 4]).readUInt32BE());
    expect(bufferReader["pos"]).toBe(4);
  });

  test("readUInt64BEBigInt returns correct value and updates position", () => {
    // Create a BufferReader with a buffer that contains the 64-bit unsigned integer 0x0123456789ABCDEF
    bufferReader = new IsoBufReader(
      Buffer.from([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
    );

    const result = bufferReader.readU64BE().unwrap();

    // Check that the method returns the correct BigInt
    expect(result).toEqual(BigInt("0x0123456789ABCDEF"));

    // Check that the position has been updated correctly
    expect(bufferReader["pos"]).toBe(8);
  });

  test("readVarIntNum returns correct value and updates position for small numbers", () => {
    const result = bufferReader.readVarIntNum().unwrap();
    expect(result).toBe(1); // Assuming that the implementation treats a single byte as a varint
    expect(bufferReader["pos"]).toBe(1);
  });

  test("readVarIntNum returns correct value and updates position for 16 bit numbers", () => {
    const buf = Buffer.from([0xfd, 0, 0, 0, 0]);
    buf.writeUInt16BE(500, 1);
    bufferReader = new IsoBufReader(buf); // A varint that represents the number 2^30
    const result = bufferReader.readVarIntNum().unwrap();
    expect(result).toBe(500); // 2^30
    expect(bufferReader["pos"]).toBe(3);
  });

  test("readVarIntNum returns correct value and updates position for 32 bit numbers", () => {
    const buf = Buffer.from([254, 0, 0, 0, 0]);
    buf.writeUInt32BE(2000000000, 1);
    bufferReader = new IsoBufReader(buf); // A varint that represents the number 2^30
    const result = bufferReader.readVarIntNum().unwrap();
    expect(result).toBe(2000000000); // 2^30
    expect(bufferReader["pos"]).toBe(5);
  });

  test("readVarIntNum", () => {
    let bufferReader = new IsoBufReader(Buffer.from([0xfd, 0x00, 0x01]));
    expect(bufferReader.readVarIntNum().val).toBe(
      "read_var_int 1: unable to read varint buffer: read_var_int_buf 3: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntNum().val).toBe(
      "read_var_int 1: unable to read varint buffer: read_var_int_buf 5: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntNum().val).toBe(
      "read_var_int 1: unable to read varint buffer: read_var_int_buf 7: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(Buffer.from([0x01]));
    expect(bufferReader.readVarIntNum().unwrap()).toBe(1);
  });

  test("readVarIntBuf", () => {
    let bufferReader = new IsoBufReader(Buffer.from([0xfd, 0x00, 0x01]));
    expect(bufferReader.readVarIntBuf().val).toEqual(
      "read_var_int_buf 3: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntBuf().val).toEqual(
      "read_var_int_buf 5: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntBuf().val).toEqual(
      "read_var_int_buf 7: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(Buffer.from([0x01]));
    expect(bufferReader.readVarIntBuf().unwrap()).toEqual(Buffer.from([0x01]));
  });

  test("readVarInt", () => {
    let bufferReader = new IsoBufReader(Buffer.from([0xfd, 0x00, 0x01]));
    expect(bufferReader.readVarInt().val).toEqual(
      "read_var_int 1: unable to read varint buffer: read_var_int_buf 3: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarInt().val).toEqual(
      "read_var_int 1: unable to read varint buffer: read_var_int_buf 5: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarInt().val).toEqual(
      "read_var_int 1: unable to read varint buffer: read_var_int_buf 7: non-minimal varint encoding",
    );

    bufferReader = new IsoBufReader(Buffer.from([0x01]));
    expect(bufferReader.readVarInt().unwrap()).toEqual(BigInt(1));
  });

  describe("test vectors", () => {
    interface TestVectorIsoBufReader {
      read_iso_buf: TestVectorReadIsoBuf;
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
      "../../../json/iso_buf_reader.json",
    );
    const jsonString = fs.readFileSync(filePath, "utf-8");
    const testVector: TestVectorIsoBufReader = JSON.parse(jsonString);

    test("test vectors: read_iso_buf", () => {
      testVector.read_iso_buf.errors.forEach((test) => {
        const buf = Buffer.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        expect(bufferReader.readIsoBuf(test.len).val).toMatch(
          new RegExp("^" + test.error),
        );
      });
    });

    test("test vectors: read_u8", () => {
      testVector.read_u8.errors.forEach((test) => {
        const buf = Buffer.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        expect(bufferReader.readU8().val).toMatch(new RegExp("^" + test.error));
      });
    });

    test("test vectors: read_u16_be", () => {
      testVector.read_u16_be.errors.forEach((test) => {
        const buf = Buffer.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        expect(bufferReader.readU16BE().val).toMatch(
          new RegExp("^" + test.error),
        );
      });
    });

    test("test vectors: read_u32_be", () => {
      testVector.read_u32_be.errors.forEach((test) => {
        const buf = Buffer.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        expect(bufferReader.readU32BE().val).toMatch(
          new RegExp("^" + test.error),
        );
      });
    });

    test("test vectors: read_u64_be", () => {
      testVector.read_u64_be.errors.forEach((test) => {
        const buf = Buffer.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        expect(bufferReader.readU64BE().val).toMatch(
          new RegExp("^" + test.error),
        );
      });
    });

    test("test vectors: read_var_int_buf", () => {
      testVector.read_var_int_buf.errors.forEach((test) => {
        const buf = Buffer.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        expect(bufferReader.readVarIntBuf().val).toMatch(
          new RegExp("^" + test.error),
        );
      });
    });

    test("test vectors: read_var_int", () => {
      testVector.read_var_int.errors.forEach((test) => {
        const buf = Buffer.from(test.hex, "hex");
        const bufferReader = new IsoBufReader(buf);
        expect(bufferReader.readVarInt().val).toMatch(
          new RegExp("^" + test.error),
        );
      });
    });
  });
});
