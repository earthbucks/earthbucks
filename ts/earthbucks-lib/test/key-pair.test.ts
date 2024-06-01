import { describe, expect, test } from "vitest";
import { KeyPair } from "../src/key-pair.js";
import { PrivKey } from "../src/priv-key.js";
import fs from "fs";
import path from "path";
import { IsoBuf } from "../src/iso-buf.js";

describe("KeyPair", () => {
  test("KeyPair", () => {
    const keypair = KeyPair.fromRandom();
    expect(keypair.privKey.toIsoBuf()).toBeDefined();
    expect(keypair.pubKey.toIsoBuf()).toBeDefined();
  });

  describe("standard test vectors: key_pair.json", () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, "../test-vectors/key_pair.json"),
      "utf-8",
    );

    test("key pairs", () => {
      interface KeyPairJSON {
        priv_key: string;
        pub_key: string;
      }
      const keyPairs: KeyPairJSON[] = JSON.parse(data).key_pair;

      for (const pair of keyPairs) {
        const privKeyBuf = IsoBuf.from(pair.priv_key, "hex");
        const privKey = PrivKey.fromIsoStr(pair.priv_key).unwrap();
        const key = KeyPair.fromPrivKey(privKey);
        expect(key.pubKey.toIsoStr()).toBe(pair.pub_key);
      }
    });
  });
});
