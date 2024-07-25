import { describe, it, expect } from "vitest";
import { U8, U16, U32, U64, U128, U256 } from "../src/numbers.js";

describe("Numbers", () => {
  it("test U8", () => {
    const a = new U8(10n);
    const b = new U8(20n);
    expect(a.add(b).bn).toBe(30n);
    expect(a.mul(b).bn).toBe(200n);
  });

  it("test U16", () => {
    const a = new U16(10n);
    const b = new U16(20n);
    expect(a.add(b).bn).toBe(30n);
    expect(a.mul(b).bn).toBe(200n);
  });

  it("test U32", () => {
    const a = new U32(10n);
    const b = new U32(20n);
    expect(a.add(b).bn).toBe(30n);
    expect(a.mul(b).bn).toBe(200n);
  });

  it("test U64", () => {
    const a = new U64(10n);
    const b = new U64(20n);
    expect(a.add(b).bn).toBe(30n);
    expect(a.mul(b).bn).toBe(200n);
  });

  it("test U128", () => {
    const a = new U128(10n);
    const b = new U128(20n);
    expect(a.add(b).bn).toBe(30n);
    expect(a.mul(b).bn).toBe(200n);
  });

  it("test U256", () => {
    const a = new U256(10n);
    const b = new U256(20n);
    expect(a.add(b).bn).toBe(30n);
    expect(a.mul(b).bn).toBe(200n);
  });
});
