import { expect, describe, test, it } from "vitest";
import { BufReader, BufWriter } from "../src/index.js";

describe("BufReader", () => {
  it("should exist", () => {
    expect(BufReader).toBeDefined();
  });
});

describe("BufWriter", () => {
  it("should exist", () => {
    expect(BufWriter).toBeDefined();
  });
});
