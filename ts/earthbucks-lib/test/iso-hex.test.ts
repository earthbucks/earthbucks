import { describe, expect, test } from "vitest";
import { IsoHex } from "../src/iso-hex";
import { EbxBuf } from "../src/ebx-buf";

describe("strictHex", () => {
  test("should return true for valid hex strings", () => {
    expect(IsoHex.isValid("00")).toBe(true);
    expect(IsoHex.isValid("1234567890abcdef")).toBe(true);
    expect(IsoHex.isValid("1234567890abcde")).toBe(false);
  });

  test("should return false for invalid hex strings", () => {
    expect(IsoHex.isValid("0")).toBe(false);
    expect(IsoHex.isValid("0g")).toBe(false);
    expect(IsoHex.isValid("1234567890abcdeF")).toBe(false);
  });

  test("encode/decode", () => {
    const buffer = EbxBuf.from("1234567890abcdef", "hex");
    const hex = IsoHex.encode(buffer);
    const decodedIsoBuf = IsoHex.decode(hex).unwrap();
    expect(decodedIsoBuf).toEqual(buffer);
  });
});
