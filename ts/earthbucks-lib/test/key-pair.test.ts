import { describe, expect, test } from "vitest";
import { KeyPair } from "../src/key-pair.js";
import { PrivKey } from "../src/priv-key.js";
import fs from "node:fs";
import path from "node:path";
import { WebBuf } from "@webbuf/webbuf";

describe("KeyPair", () => {
  test("KeyPair", () => {
    const keypair = KeyPair.fromRandom();
    expect(keypair.privKey.toBuf()).toBeDefined();
    expect(keypair.pubKey.toBuf()).toBeDefined();
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
        const privKeyBuf = WebBuf.from(pair.priv_key, "hex");
        const privKey = PrivKey.fromString(pair.priv_key);
        const key = KeyPair.fromPrivKey(privKey);
        expect(key.pubKey.toString()).toBe(pair.pub_key);
      }
    });
  });

  describe("add", () => {
    test("add 1", () => {
      const key1 = KeyPair.fromRandom();
      const key2 = KeyPair.fromRandom();
      const key3 = key1.add(key2);
      expect(key3).toBeDefined();
      const privKey1 = key1.privKey;
      const privKey2 = key2.privKey;
      const privKey3 = privKey1.add(privKey2);
      expect(privKey3.toHex()).toEqual(key3.privKey.toHex());
      const key3_2 = KeyPair.fromPrivKey(privKey3);
      expect(key3.pubKey.toHex()).toEqual(key3_2.pubKey.toHex());
    });

    test("add 2", () => {
      const key1 = KeyPair.fromPrivKey(PrivKey.fromHex("01".repeat(32)));
      const key2 = KeyPair.fromPrivKey(PrivKey.fromHex("01".repeat(32)));
      const key3 = key1.add(key2);
      expect(key3).toBeDefined();
      const privKey1 = key1.privKey;
      const privKey2 = key2.privKey;
      const privKey3 = privKey1.add(privKey2);
      expect(privKey3.toHex()).toEqual(key3.privKey.toHex());
      const key3_2 = KeyPair.fromPrivKey(privKey3);
      expect(key3.pubKey.toHex()).toEqual(key3_2.pubKey.toHex());
    });

    test("add 3", () => {
      const privKey1 = PrivKey.fromHex("01".repeat(32));
      const key1 = KeyPair.fromPrivKey(privKey1);
      const privKey2 = PrivKey.fromHex("01".repeat(32));
      const key2 = KeyPair.fromPrivKey(privKey2);
      const key3 = key1.add(key2);
      expect(key3.privKey.toHex()).toEqual("02".repeat(32));
      expect(key3.pubKey.toHex()).toEqual(
        "024d4b6cd1361032ca9bd2aeb9d900aa4d45d9ead80ac9423374c451a7254d0766",
      );
    });
  });
});
