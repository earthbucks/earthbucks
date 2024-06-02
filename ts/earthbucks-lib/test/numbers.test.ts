import { describe, it, expect } from "vitest";
import {
  U8,
  I8,
  U16,
  I16,
  U32,
  I32,
  U64,
  I64,
  U128,
  I128,
  U256,
  I256,
} from "../src/numbers.js";

describe("Numbers", () => {
  it("test U8", () => {
    const a = new U8(10);
    const b = new U8(20);
    expect(a.add(b).getValue()).toBe(30);
    expect(a.mul(b).getValue()).toBe(200);
  });

  it("test I8", () => {
    const a = new I8(10);
    const b = new I8(2);
    expect(a.add(b).getValue()).toBe(12);
    expect(a.mul(b).getValue()).toBe(20);
  });

  it("test U16", () => {
    const a = new U16(10);
    const b = new U16(20);
    expect(a.add(b).getValue()).toBe(30);
    expect(a.mul(b).getValue()).toBe(200);
  });

  it("test I16", () => {
    const a = new I16(10);
    const b = new I16(20);
    expect(a.add(b).getValue()).toBe(30);
    expect(a.mul(b).getValue()).toBe(200);
  });

  it("test U32", () => {
    const a = new U32(10);
    const b = new U32(20);
    expect(a.add(b).getValue()).toBe(30);
    expect(a.mul(b).getValue()).toBe(200);
  });

  it("test I32", () => {
    const a = new I32(10);
    const b = new I32(20);
    expect(a.add(b).getValue()).toBe(30);
    expect(a.mul(b).getValue()).toBe(200);
  });

  it("test U64", () => {
    const a = new U64(10n);
    const b = new U64(20n);
    expect(a.add(b).getValue()).toBe(30n);
    expect(a.mul(b).getValue()).toBe(200n);
  });

  it("test I64", () => {
    const a = new I64(10n);
    const b = new I64(20n);
    expect(a.add(b).getValue()).toBe(30n);
    expect(a.mul(b).getValue()).toBe(200n);
  });

  it("test U128", () => {
    const a = new U128(10n);
    const b = new U128(20n);
    expect(a.add(b).getValue()).toBe(30n);
    expect(a.mul(b).getValue()).toBe(200n);
  });

  it("test I128", () => {
    const a = new I128(10n);
    const b = new I128(20n);
    expect(a.add(b).getValue()).toBe(30n);
    expect(a.mul(b).getValue()).toBe(200n);
  });

  it("test U256", () => {
    const a = new U256(10n);
    const b = new U256(20n);
    expect(a.add(b).getValue()).toBe(30n);
    expect(a.mul(b).getValue()).toBe(200n);
  });

  it("test I256", () => {
    const a = new I256(10n);
    const b = new I256(20n);
    expect(a.add(b).getValue()).toBe(30n);
    expect(a.mul(b).getValue()).toBe(200n);
  });
});
