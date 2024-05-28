import { describe, expect, test, beforeEach, it } from "vitest";
import { SignedMessage } from "../src/signed-message.ts";
import { PubKey } from "../src/pub-key.ts";
import { PrivKey } from "../src/priv-key.ts";

describe("SignedMessage", () => {
  test("sign and verify", async () => {
    const privKey = PrivKey.fromRandom();
    const pubKey = PubKey.fromPrivKey(privKey).unwrap();
    const message = Buffer.from("message");
    const keyStr = "signed message";
    const signedMessage = SignedMessage.fromSignMessage(
      privKey,
      message,
      keyStr,
    );
    expect(signedMessage.isValid(pubKey, keyStr)).toBe(true);
  });
});
