import { describe, expect, test, beforeEach } from "@jest/globals";
import IsoBufReader from "../src/iso-buf-reader";
import { Buffer } from "buffer";

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
    const result = bufferReader.readBuffer(len).unwrap();
    expect(result).toEqual(testBuffer.subarray(0, len));
  });

  test("read updates position", () => {
    const len = 4;
    bufferReader.readBuffer(len);
    expect(bufferReader["pos"]).toBe(len);
  });

  test("readUInt8 returns correct value and updates position", () => {
    const result = bufferReader.readUInt8().unwrap();
    expect(result).toBe(1);
    expect(bufferReader["pos"]).toBe(1);
  });

  test("readInt8 returns correct value and updates position", () => {
    const result = bufferReader.readInt8().unwrap();
    expect(result).toBe(1);
    expect(bufferReader["pos"]).toBe(1);
  });

  test("readUInt16BE returns correct value and updates position", () => {
    const result = bufferReader.readUInt16BE().unwrap();
    expect(result).toBe(Buffer.from([1, 2]).readUInt16BE());
    expect(bufferReader["pos"]).toBe(2);
  });

  test("readInt16BE returns correct value and updates position", () => {
    const result = bufferReader.readInt16BE().unwrap();
    expect(result).toBe(Buffer.from([1, 2]).readInt16BE());
    expect(bufferReader["pos"]).toBe(2);
  });

  test("readUInt32BE returns correct value and updates position", () => {
    const result = bufferReader.readUInt32BE().unwrap();
    expect(result).toBe(Buffer.from([1, 2, 3, 4]).readUInt32BE());
    expect(bufferReader["pos"]).toBe(4);
  });

  test("readInt32BE returns correct value and updates position", () => {
    const result = bufferReader.readInt32BE().unwrap();
    expect(result).toBe(Buffer.from([1, 2, 3, 4]).readInt32BE());
    expect(bufferReader["pos"]).toBe(4);
  });

  test("readUInt64BEBigInt returns correct value and updates position", () => {
    // Create a BufferReader with a buffer that contains the 64-bit unsigned integer 0x0123456789ABCDEF
    bufferReader = new IsoBufReader(
      Buffer.from([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]),
    );

    const result = bufferReader.readUInt64BE().unwrap();

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
      "Non-minimal varint encoding 1",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntNum().val).toBe(
      "Non-minimal varint encoding 2",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntNum().val).toBe(
      "Non-minimal varint encoding 3",
    );

    bufferReader = new IsoBufReader(Buffer.from([0x01]));
    expect(bufferReader.readVarIntNum().unwrap()).toBe(1);
  });

  test("readVarIntBuf", () => {
    let bufferReader = new IsoBufReader(Buffer.from([0xfd, 0x00, 0x01]));
    expect(bufferReader.readVarIntBuf().val).toEqual(
      "Non-minimal varint encoding 1",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntBuf().val).toEqual(
      "Non-minimal varint encoding 2",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarIntBuf().val).toEqual(
      "Non-minimal varint encoding 3",
    );

    bufferReader = new IsoBufReader(Buffer.from([0x01]));
    expect(bufferReader.readVarIntBuf().unwrap()).toEqual(Buffer.from([0x01]));
  });

  test("readVarIntBigInt", () => {
    let bufferReader = new IsoBufReader(Buffer.from([0xfd, 0x00, 0x01]));
    expect(bufferReader.readVarInt().val).toEqual(
      "Non-minimal varint encoding 1",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xfe, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarInt().val).toEqual(
      "Non-minimal varint encoding 2",
    );

    bufferReader = new IsoBufReader(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    );
    expect(bufferReader.readVarInt().val).toEqual(
      "Non-minimal varint encoding 3",
    );

    bufferReader = new IsoBufReader(Buffer.from([0x01]));
    expect(bufferReader.readVarInt().unwrap()).toEqual(BigInt(1));
  });
});
