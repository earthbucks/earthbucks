import { describe, expect, test, beforeEach, it } from "@jest/globals";
import SignedMessage from "../src/signed-message";
import PubKey from "../src/pub-key";
import PrivKey from "../src/priv-key";

describe("SignedMessage", () => {
  test("sign and verify", async () => {
    const privKey = PrivKey.fromRandom();
    const pubKey = PubKey.fromPrivKey(privKey);
    const message = Buffer.from("message");
    const signedMessage = SignedMessage.signFromMessage(privKey, message);
    expect(signedMessage.verify(pubKey)).toBe(true);
  });
});
