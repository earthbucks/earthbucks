import { describe, expect, test } from "@jest/globals";
import PrivKey from "../src/priv-key";

describe("PrivKey", () => {
  test("PrivKey", () => {
    const privKey = PrivKey.fromRandom();
    expect(privKey).toBeDefined();
  });

  test("to/from string format", () => {
    expect(
      PrivKey.isValidStringFmt(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ",
      ),
    ).toBe(true);
    expect(
      PrivKey.isValidStringFmt(
        "ebxprv78675b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ",
      ),
    ).toBe(false);
    expect(
      PrivKey.isValidStringFmt(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjx",
      ),
    ).toBe(false);

    let str = "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ";
    let privKey2 = PrivKey.fromStringFmt(str);
    expect(privKey2.toStringFmt()).toBe(str);
  });
});
