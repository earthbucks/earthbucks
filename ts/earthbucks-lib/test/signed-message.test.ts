import { describe, expect, test, beforeEach, it } from "vitest";
import { SignedMessage } from "../src/signed-message.js";
import { PubKey } from "../src/pub-key.js";
import { PrivKey } from "../src/priv-key.js";
import { WebBuf } from "../src/buf.js";

describe("SignedMessage", () => {
  test("sign and verify", async () => {
    const privKey = PrivKey.fromRandom();
    const pubKey = PubKey.fromPrivKey(privKey);
    const message = WebBuf.from("message");
    const keyStr = "signed message";
    const signedMessage = SignedMessage.fromSignMessage(
      privKey,
      message,
      keyStr,
    );
    expect(signedMessage.isValid(pubKey, keyStr)).toBe(true);
  });
});
