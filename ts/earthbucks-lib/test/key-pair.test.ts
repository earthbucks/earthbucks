import { describe, expect, test } from "@jest/globals";
import KeyPair from "../src/key-pair";
import PrivKey from "../src/priv-key";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

describe("KeyPair", () => {
  test("KeyPair", () => {
    const keypair = KeyPair.fromRandom();
    expect(keypair.privKey.toBuffer()).toBeDefined();
    expect(keypair.pubKey.toBuffer()).toBeDefined();
  });

  describe("standard test vectors: key-pair.json", () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, "../../../json/key-pair.json"),
      "utf-8",
    );

    test("key pairs", () => {
      interface KeyPairJSON {
        priv_key: string;
        pub_key: string;
      }
      const keyPairs: KeyPairJSON[] = JSON.parse(data).key_pair;

      for (const pair of keyPairs) {
        const privKeyBuf = Buffer.from(pair.priv_key, "hex");
        const privKey = PrivKey.fromStringFmt(pair.priv_key);
        const key = KeyPair.fromPrivKey(privKey);
        expect(key.pubKey.toStringFmt()).toBe(pair.pub_key);
      }
    });
  });
});
