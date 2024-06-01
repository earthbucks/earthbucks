import { describe, expect, test } from "vitest";
import { PrivKey } from "../src/priv-key.js";

describe("PrivKey", () => {
  test("PrivKey", () => {
    const privKey = PrivKey.fromRandom();
    expect(privKey).toBeDefined();
  });

  test("to/from string format", () => {
    expect(
      PrivKey.isValidIsoStr(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ",
      ),
    ).toBe(true);
    expect(
      PrivKey.isValidIsoStr(
        "ebxprv78675b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ",
      ),
    ).toBe(false);
    expect(
      PrivKey.isValidIsoStr(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjx",
      ),
    ).toBe(false);

    const str = "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ";
    const privKey2 = PrivKey.fromIsoStr(str).unwrap();
    expect(privKey2.toIsoStr()).toBe(str);
  });
});
