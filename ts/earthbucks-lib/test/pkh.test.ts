import { describe, expect, test } from "@jest/globals";
import KeyPair from "../src/key-pair";
import fs from "fs";
import path from "path";
import Pkh from "../src/pkh";
import { Buffer } from "buffer";
import PubKey from "../src/pub-key";

describe("Pkh", () => {
  test("Pkh", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuffer(Buffer.from(key.pubKey.toBuffer()));
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
      Pkh.fromStringFmt(
        "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4",
      ).toStringFmt(),
    ).toEqual("ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4");
  });

  describe("standard test vectors: pkh.json", () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, "../../../json/pkh.json"),
      "utf-8",
    );

    test("pkh pairs", () => {
      interface AddressPair {
        pub_key: string;
        pkh: string;
      }
      const pkhPairs: AddressPair[] = JSON.parse(data).pkh;

      for (const pair of pkhPairs) {
        const pubKey = PubKey.fromStringFmt(pair.pub_key);
        const pkh = Pkh.fromPubKey(pubKey);
        expect(pkh.toStringFmt()).toBe(pair.pkh);
      }
    });
  });
});
