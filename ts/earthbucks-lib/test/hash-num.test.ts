import { describe, expect, test, beforeEach, it } from "@jest/globals";
import HashNum from "../src/hash-num";

describe("TargetNum", () => {
  test("fromTarget", () => {
    const hash = Buffer.from(
      "a2aec69152c0e428871b5782ddd643e1e5c3f305c27e69142939e614958462cc",
      "hex",
    );
    const hashNum = HashNum.fromBuffer(hash);
    expect(hashNum.num).toBe(
      BigInt(
        "0xa2aec69152c0e428871b5782ddd643e1e5c3f305c27e69142939e614958462cc",
      ),
    );
  });
});
