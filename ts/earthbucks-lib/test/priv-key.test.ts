import { describe, expect, test } from "vitest";
import { PrivKey } from "../src/priv-key.js";

describe("PrivKey", () => {
  test("PrivKey", () => {
    const privKey = PrivKey.fromRandom();
    expect(privKey).toBeDefined();
  });

  test("to/from string format", () => {
    expect(
      PrivKey.isValidStrictStr(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ",
      ),
    ).toBe(true);
    expect(
      PrivKey.isValidStrictStr(
        "ebxprv78675b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ",
      ),
    ).toBe(false);
    expect(
      PrivKey.isValidStrictStr(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjx",
      ),
    ).toBe(false);

    const str = "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ";
    const privKey2 = PrivKey.fromStrictStr(str);
    expect(privKey2.toStrictStr()).toBe(str);
  });
});
