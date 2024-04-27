import { describe, expect, test } from "@jest/globals";
import KeyPair from "../src/key-pair";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

describe("KeyPair", () => {
  test("Keypair", () => {
    const keypair = KeyPair.fromRandom();
    expect(keypair.privateKey).toBeDefined();
    expect(keypair.publicKey).toBeDefined();
  });

  describe("standard test vectors: key.json", () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, "../../../json/key.json"),
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
        const privKey = new Uint8Array(privKeyBuf);
        const key = new KeyPair(privKey);
        expect(Buffer.from(key.publicKey).toString("hex")).toBe(pair.pub_key);
      }
    });
  });
});
