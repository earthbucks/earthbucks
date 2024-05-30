import { describe, expect, test } from "vitest";
import { StrictHex } from "../src/strict-hex";
import { IsoBuf } from "../src/iso-buf";

describe("strictHex", () => {
  test("should return true for valid hex strings", () => {
    expect(StrictHex.isValid("00")).toBe(true);
    expect(StrictHex.isValid("1234567890abcdef")).toBe(true);
    expect(StrictHex.isValid("1234567890abcde")).toBe(false);
  });

  test("should return false for invalid hex strings", () => {
    expect(StrictHex.isValid("0")).toBe(false);
    expect(StrictHex.isValid("0g")).toBe(false);
    expect(StrictHex.isValid("1234567890abcdeF")).toBe(false);
  });

  test("encode/decode", () => {
    const buffer = IsoBuf.from("1234567890abcdef", "hex");
    const hex = StrictHex.encode(buffer);
    const decodedIsoBuf = StrictHex.decode(hex).unwrap();
    expect(decodedIsoBuf).toEqual(buffer);
  });
});
