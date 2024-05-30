import { describe, expect, test, beforeEach, it } from "vitest";
import { HashNum } from "../src/hash-num";
import { IsoBuf } from "../src/iso-buf.js";

describe("TargetNum", () => {
  test("fromTarget", () => {
    const hash = IsoBuf.from(
      "a2aec69152c0e428871b5782ddd643e1e5c3f305c27e69142939e614958462cc",
      "hex",
    );
    const hashNum = HashNum.fromIsoBuf(hash).unwrap();
    expect(hashNum.num).toBe(
      BigInt(
        "0xa2aec69152c0e428871b5782ddd643e1e5c3f305c27e69142939e614958462cc",
      ),
    );
  });
});
