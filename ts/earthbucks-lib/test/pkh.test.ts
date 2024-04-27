import { describe, expect, test } from "@jest/globals";
import KeyPair from "../src/key-pair";
import fs from "fs";
import path from "path";
import Pkh from "../src/pkh";
import { Buffer } from "buffer";

describe("Pkh", () => {
  test("Pkh", () => {
    const key = KeyPair.fromRandom();
    const pkh = Pkh.fromPubKeyBuffer(Buffer.from(key.publicKey));
    expect(pkh.buf).toBeDefined();
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
        const pubKeyBuf = Buffer.from(pair.pub_key, "hex");
        const pubKey = new Uint8Array(pubKeyBuf);
        const pkh = Pkh.fromPubKeyBuffer(Buffer.from(pubKey));
        expect(Buffer.from(pkh.buf).toString("hex")).toBe(pair.pkh);
      }
    });
  });
});
