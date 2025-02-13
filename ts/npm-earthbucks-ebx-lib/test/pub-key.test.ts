import { describe, expect, test } from "vitest";
import { PubKey } from "../src/pub-key.js";
import { PrivKey } from "../src/priv-key.js";

describe("PubKey", () => {
  test("PubKey", () => {
    const privKey = PrivKey.fromRandom();
    const pubKey = PubKey.fromPrivKey(privKey);
    expect(pubKey).toBeDefined();
  });

  test("to/from string format", () => {
    expect(
      PubKey.isValidStrictStr(
        "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo",
      ),
    ).toBe(true);
    expect(
      PubKey.isValidStrictStr(
        "ebxpu5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo",
      ),
    ).toBe(false);
    expect(
      PubKey.isValidStrictStr(
        "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYV",
      ),
    ).toBe(false);

    const pubKey = PubKey.fromString(
      "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo",
    );
    expect(pubKey.toString()).toEqual(
      "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo",
    );
  });

  describe("add", () => {
    test("add 1", () => {
      const privKey1 = PrivKey.fromRandom();
      const pubKey1 = PubKey.fromPrivKey(privKey1);
      const privKey2 = PrivKey.fromRandom();
      const pubKey2 = PubKey.fromPrivKey(privKey2);
      const pubKey3 = pubKey1.add(pubKey2);
      expect(pubKey3).toBeDefined();
      const privKey3 = privKey1.add(privKey2);
      const pubKey3_2 = PubKey.fromPrivKey(privKey3);
      expect(pubKey3.toHex()).toBe(pubKey3_2.toHex());
    });

    test("add 2", () => {
      const privKey1 = PrivKey.fromHex("01".repeat(32));
      const pubKey1 = PubKey.fromPrivKey(privKey1);
      const privKey2 = PrivKey.fromHex("01".repeat(32));
      const pubKey2 = PubKey.fromPrivKey(privKey2);
      const pubKey3 = pubKey1.add(pubKey2);
      expect(pubKey3.toHex()).toBe(
        "024d4b6cd1361032ca9bd2aeb9d900aa4d45d9ead80ac9423374c451a7254d0766",
      );
      const privKey3 = privKey1.add(privKey2);
      const pubKey3_2 = PubKey.fromPrivKey(privKey3);
      expect(pubKey3.toHex()).toBe(pubKey3_2.toHex());
    });

    test("add 3", () => {
      const privKey1 = PrivKey.fromRandom();
      const pubKey1 = PubKey.fromPrivKey(privKey1);
      const privKey2 = PrivKey.fromRandom();
      const pubKey2 = PubKey.fromPrivKey(privKey2);
      const pubKey3 = pubKey1.add(pubKey2);
      const privKey3 = privKey1.add(privKey2);
      const pubKey3_2 = PubKey.fromPrivKey(privKey3);
      expect(pubKey3.toHex()).toBe(pubKey3_2.toHex());
    });
  });
});
