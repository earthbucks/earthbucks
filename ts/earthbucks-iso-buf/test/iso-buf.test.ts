import { describe, test, expect } from "vitest";
import { IsoBuf, IsoBuf32, FixedIsoBuf } from "../src/iso-buf";

describe("IsoBuf", () => {
  test("it should make an iso buf of size 32", () => {
    const isoBuf: FixedIsoBuf<32> = new FixedIsoBuf<32>(new Uint8Array(32), 32);
    const isoBuf2: IsoBuf32 = new IsoBuf32(new Uint8Array(32));
    const isoBuf3: IsoBuf32 = IsoBuf32.fromUint8Array(
      new Uint8Array(32),
    ).unwrap();
    const isoBuf4: FixedIsoBuf<32> = FixedIsoBuf.fromUint8Array(
      new Uint8Array(32),
      32,
    ).unwrap();
    const isoBuf5: FixedIsoBuf<32> = new IsoBuf32(new Uint8Array(32));
    expect(isoBuf).toBeDefined();
    expect(isoBuf2).toBeDefined();
    expect(isoBuf3).toBeDefined();
    expect(isoBuf4).toBeDefined();
    expect(isoBuf5).toBeDefined();
  });
});
