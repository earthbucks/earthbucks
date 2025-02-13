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
    const privKey2 = PrivKey.fromString(str);
    expect(privKey2.toString()).toBe(str);
  });

  describe("add", () => {
    test("add 1", () => {
      const privKey1 = PrivKey.fromRandom();
      const privKey2 = PrivKey.fromRandom();
      const privKey3 = privKey1.add(privKey2);
      expect(privKey3).toBeDefined();
    });

    test("add 2", () => {
      const privKey1 = PrivKey.fromHex("01".repeat(32));
      const privKey2 = PrivKey.fromHex("01".repeat(32));
      const privKey3 = privKey1.add(privKey2);
      expect(privKey3.toHex()).toBe("02".repeat(32));
    });
  });
});
