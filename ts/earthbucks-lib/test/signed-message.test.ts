import { describe, expect, test, beforeEach, it } from "vitest";
import { SignedMessage } from "../src/signed-message";
import { PubKey } from "../src/pub-key";
import { PrivKey } from "../src/priv-key";
import { EbxBuffer } from "../src/ebx-buffer";

describe("SignedMessage", () => {
  test("sign and verify", async () => {
    const privKey = PrivKey.fromRandom();
    const pubKey = PubKey.fromPrivKey(privKey).unwrap();
    const message = EbxBuffer.from("message");
    const keyStr = "signed message";
    const signedMessage = SignedMessage.fromSignMessage(
      privKey,
      message,
      keyStr,
    );
    expect(signedMessage.isValid(pubKey, keyStr)).toBe(true);
  });
});
