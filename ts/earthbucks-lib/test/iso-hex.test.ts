import { describe, expect, test } from "@jest/globals";
import * as strictHex from "../src/iso-hex";

describe("strictHex", () => {
  test("should return true for valid hex strings", () => {
    expect(strictHex.isValid("00")).toBe(true);
    expect(strictHex.isValid("1234567890abcdef")).toBe(true);
    expect(strictHex.isValid("1234567890abcde")).toBe(false);
  });

  test("should return false for invalid hex strings", () => {
    expect(strictHex.isValid("0")).toBe(false);
    expect(strictHex.isValid("0g")).toBe(false);
    expect(strictHex.isValid("1234567890abcdeF")).toBe(false);
  });

  test("encode/decode", () => {
    const buffer = Buffer.from("1234567890abcdef", "hex");
    const hex = strictHex.encode(buffer);
    const decodedBuffer = strictHex.decode(hex);
    expect(decodedBuffer).toEqual(buffer);
  });
});
