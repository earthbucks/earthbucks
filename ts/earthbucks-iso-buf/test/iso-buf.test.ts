import { describe, test, expect } from "vitest";
import { U8Arr, U8_32, FixedU8 } from "../src/u8-arr";

describe("IsoBuf", () => {
  test("it should make an iso buf of size 32", () => {
    const isoBuf: FixedU8<32> = new FixedU8<32>(new Uint8Array(32), 32);
    const isoBuf2: U8_32 = new U8_32(new Uint8Array(32));
    const isoBuf3: U8_32 = U8_32.fromUint8Array(new Uint8Array(32)).unwrap();
    const isobuf4: FixedU8<32> = FixedU8.fromUint8Array(
      new Uint8Array(32),
      32,
    ).unwrap();
    expect(isoBuf).toBeDefined();
    expect(isoBuf2).toBeDefined();
    expect(isoBuf3).toBeDefined();
    expect(isobuf4).toBeDefined();
  });
});
