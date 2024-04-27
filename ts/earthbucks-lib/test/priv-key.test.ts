import { describe, expect, test } from "@jest/globals";
import PrivKey from "../src/priv-key";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

describe("PrivKey", () => {
  test("PrivKey", () => {
    const privKey = PrivKey.fromRandom();
    expect(privKey).toBeDefined();
  });

  test("to/from string format", () => {
    expect(
      PrivKey.isValid("ebxprvGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaMogoHUtzes"),
    ).toBe(true);
    expect(
      PrivKey.isValid("ebxprGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaMogoHUtzes"),
    ).toBe(false);
    expect(
      PrivKey.isValid("ebxprvGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaM"),
    ).toBe(false);

    let str = "ebxprvGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaMogoHUtzes";
    let privKey2 = PrivKey.fromStringFmt(str);
    expect(privKey2.toStringFmt()).toBe(str);
  });
});
