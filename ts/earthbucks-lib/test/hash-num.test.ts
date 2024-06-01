import { describe, expect, test, beforeEach, it } from "vitest";
import { HashNum } from "../src/hash-num.js";
import { SysBuf, FixedIsoBuf } from "../src/iso-buf.js";

describe("TargetNum", () => {
  test("fromTarget", () => {
    const hash = FixedIsoBuf.fromHex(
      32,
      "a2aec69152c0e428871b5782ddd643e1e5c3f305c27e69142939e614958462cc",
    ).unwrap();
    const hashNum = HashNum.fromIsoBuf(hash).unwrap();
    expect(hashNum.num).toBe(
      BigInt(
        "0xa2aec69152c0e428871b5782ddd643e1e5c3f305c27e69142939e614958462cc",
      ),
    );
  });
});
