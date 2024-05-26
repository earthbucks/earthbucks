import { describe, expect, test, beforeEach, it } from "vitest";
import PkhKeyMap from "../src/pkh-key-map";
import Pkh from "../src/pkh";
import KeyPair from "../src/key-pair";
import { Buffer } from "buffer";

describe("PkhKeyMap", () => {
  let pkhKeyMap: PkhKeyMap;
  let key: KeyPair;
  let pkh: Pkh;
  let pkhBuf: Buffer;

  beforeEach(() => {
    pkhKeyMap = new PkhKeyMap();
    key = KeyPair.fromRandom();
    pkh = Pkh.fromPubKeyBuf(Buffer.from(key.pubKey.toIsoBuf()));
    pkhBuf = pkh.buf;
  });

  test("add", () => {
    pkhKeyMap.add(key, pkhBuf);
    expect(
      Buffer.from(pkhKeyMap.get(pkhBuf)?.privKey.toIsoBuf() || "").toString(
        "hex",
      ),
    ).toEqual(Buffer.from(key.privKey.toIsoBuf()).toString("hex"));
  });

  test("remove", () => {
    pkhKeyMap.add(key, pkhBuf);
    pkhKeyMap.remove(pkhBuf);
    expect(
      Buffer.from(pkhKeyMap.get(pkhBuf)?.privKey.toIsoBuf() || "").toString(
        "hex",
      ),
    ).toEqual("");
  });

  test("get", () => {
    pkhKeyMap.add(key, pkhBuf);
    expect(
      Buffer.from(pkhKeyMap.get(pkhBuf)?.privKey.toIsoBuf() || "").toString(
        "hex",
      ),
    ).toEqual(Buffer.from(key.privKey.toIsoBuf()).toString("hex"));
  });

  test("values method should return all Key values", () => {
    const key1 = key;
    const key2 = KeyPair.fromRandom();
    const pkh2 = Pkh.fromPubKeyBuf(Buffer.from(key2.pubKey.toIsoBuf()));
    const pkhU8Vec2 = pkh2.buf;
    pkhKeyMap.add(key1, pkhBuf);
    pkhKeyMap.add(key2, pkhU8Vec2);

    const values = Array.from(pkhKeyMap.values());

    expect(values.length).toBe(2);
    expect(Buffer.from(values[0].privKey.toIsoBuf()).toString("hex")).toEqual(
      Buffer.from(key1.privKey.toIsoBuf()).toString("hex"),
    );
    expect(Buffer.from(values[1].privKey.toIsoBuf()).toString("hex")).toEqual(
      Buffer.from(key2.privKey.toIsoBuf()).toString("hex"),
    );
  });
});
