import { describe, expect, test } from "@jest/globals";
import KeyPair from "../src/key-pair";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

describe("Key", () => {
  test("Key", () => {
    const key = KeyPair.fromRandom();
    expect(key.privateKey).toBeDefined();
    expect(key.publicKey).toBeDefined();
  });

  describe("standard test vectors: key.json", () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, "../../../json/key.json"),
      "utf-8",
    );

    test("key pairs", () => {
      interface KeyPair {
        priv_key: string;
        pub_key: string;
      }
      const keyPairs: KeyPair[] = JSON.parse(data).key_pair;

      for (const pair of keyPairs) {
        const privKeyBuf = Buffer.from(pair.priv_key, "hex");
        const privKey = new Uint8Array(privKeyBuf);
        const key = new KeyPair(privKey);
        expect(Buffer.from(key.publicKey).toString("hex")).toBe(pair.pub_key);
      }
    });
  });
});
