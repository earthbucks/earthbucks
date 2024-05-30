import { describe, expect, test, beforeEach, it } from "vitest";
import { PkhKeyMap } from "../src/pkh-key-map";
import { Pkh } from "../src/pkh";
import { KeyPair } from "../src/key-pair";
import { EbxBuffer } from "../src/ebx-buffer";

describe("PkhKeyMap", () => {
  let pkhKeyMap: PkhKeyMap;
  let key: KeyPair;
  let pkh: Pkh;
  let pkhBuf: EbxBuffer;

  beforeEach(() => {
    pkhKeyMap = new PkhKeyMap();
    key = KeyPair.fromRandom();
    pkh = Pkh.fromPubKeyBuf(EbxBuffer.from(key.pubKey.toIsoBuf()));
    pkhBuf = pkh.buf;
  });

  test("add", () => {
    pkhKeyMap.add(key, pkhBuf);
    expect(
      EbxBuffer.from(pkhKeyMap.get(pkhBuf)?.privKey.toIsoBuf() || "").toString(
        "hex",
      ),
    ).toEqual(EbxBuffer.from(key.privKey.toIsoBuf()).toString("hex"));
  });

  test("remove", () => {
    pkhKeyMap.add(key, pkhBuf);
    pkhKeyMap.remove(pkhBuf);
    expect(
      EbxBuffer.from(pkhKeyMap.get(pkhBuf)?.privKey.toIsoBuf() || "").toString(
        "hex",
      ),
    ).toEqual("");
  });

  test("get", () => {
    pkhKeyMap.add(key, pkhBuf);
    expect(
      EbxBuffer.from(pkhKeyMap.get(pkhBuf)?.privKey.toIsoBuf() || "").toString(
        "hex",
      ),
    ).toEqual(EbxBuffer.from(key.privKey.toIsoBuf()).toString("hex"));
  });

  test("values method should return all Key values", () => {
    const key1 = key;
    const key2 = KeyPair.fromRandom();
    const pkh2 = Pkh.fromPubKeyBuf(EbxBuffer.from(key2.pubKey.toIsoBuf()));
    const pkhU8Vec2 = pkh2.buf;
    pkhKeyMap.add(key1, pkhBuf);
    pkhKeyMap.add(key2, pkhU8Vec2);

    const values = Array.from(pkhKeyMap.values());

    expect(values.length).toBe(2);
    expect(
      EbxBuffer.from(values[0].privKey.toIsoBuf()).toString("hex"),
    ).toEqual(EbxBuffer.from(key1.privKey.toIsoBuf()).toString("hex"));
    expect(
      EbxBuffer.from(values[1].privKey.toIsoBuf()).toString("hex"),
    ).toEqual(EbxBuffer.from(key2.privKey.toIsoBuf()).toString("hex"));
  });
});
