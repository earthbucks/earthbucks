import { describe, expect, test } from "vitest";
import { KeyPair } from "../src/key-pair.js";
import fs from "fs";
import path from "path";
import { Pkh } from "../src/pkh.js";
import { IsoBuf } from "../src/iso-buf.js";
import { PubKey } from "../src/pub-key.js";

describe("Pkh", () => {
  test("Pkh", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuf(IsoBuf.from(key.pubKey.toIsoBuf()));
    expect(pkh.buf).toBeDefined();
  });

  test("to/from string format", () => {
    expect(
      Pkh.isValidStringFmt(
        "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4",
      ),
    ).toBe(true);
    expect(
      Pkh.isValidStringFmt(
        "ebxpk31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4",
      ),
    ).toBe(false);
    expect(
      Pkh.isValidStringFmt(
        "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN",
      ),
    ).toBe(false);

    expect(
      Pkh.fromIsoStr(
        "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4",
      )
        .unwrap()
        .toIsoStr(),
    ).toEqual("ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4");
  });

  describe("standard test vectors: pkh.json", () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, "../test-vectors/pkh.json"),
      "utf-8",
    );

    test("pkh pairs", () => {
      interface AddressPair {
        pub_key: string;
        pkh: string;
      }
      const pkhPairs: AddressPair[] = JSON.parse(data).pkh;

      for (const pair of pkhPairs) {
        const pubKey = PubKey.fromIsoStr(pair.pub_key).unwrap();
        const pkh = Pkh.fromPubKey(pubKey);
        expect(pkh.toIsoStr()).toBe(pair.pkh);
      }
    });
  });
});
