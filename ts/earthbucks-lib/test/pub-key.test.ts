import { describe, expect, test } from "@jest/globals";
import PubKey from "../src/pub-key";
import PrivKey from "../src/priv-key";

describe("PubKey", () => {
  test("PubKey", () => {
    const privKey = PrivKey.fromRandom();
    const pubKey = PubKey.fromPrivKey(privKey);
    expect(pubKey).toBeDefined();
  });

  test("to/from string format", () => {
    expect(
      PubKey.isValidStringFmt(
        "ebxpubcrjFAsCKzHRpw5St4Rjh5xb5SQpCaoDryB8dfWuBEF3V",
      ),
    ).toBe(true);
    expect(
      PubKey.isValidStringFmt(
        "ebxpucrjFAsCKzHRpw5St4Rjh5xb5SQpCaoDryB8dfWuBEF3V",
      ),
    ).toBe(false);
    expect(
      PubKey.isValidStringFmt(
        "ebxpubcrjFAsCKzHRpw5St4Rjh5xb5SQpCaoDryB8dfWuBE",
      ),
    ).toBe(false);

    let pubKey = PubKey.fromStringFmt(
      "ebxpubcrjFAsCKzHRpw5St4Rjh5xb5SQpCaoDryB8dfWuBEF3V",
    );
    expect(pubKey.toStringFmt()).toEqual(
      "ebxpubcrjFAsCKzHRpw5St4Rjh5xb5SQpCaoDryB8dfWuBEF3V",
    );
  });
});
