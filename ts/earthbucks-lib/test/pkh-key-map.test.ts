import { describe, expect, test, beforeEach, it } from "@jest/globals";
import PkhKeyMap from "../src/pkh-key-map";
import Pkh from "../src/pkh";
import KeyPair from "../src/key-pair";
import { Buffer } from "buffer";

describe("PkhKeyMap", () => {
  let pkhKeyMap: PkhKeyMap;
  let key: KeyPair;
  let pkh: Pkh;
  let pkhU8Vec: Uint8Array;

  beforeEach(() => {
    pkhKeyMap = new PkhKeyMap();
    key = KeyPair.fromRandom();
    pkh = Pkh.fromPubKeyBuffer(Buffer.from(key.publicKey));
    pkhU8Vec = pkh.buf;
  });

  test("add", () => {
    pkhKeyMap.add(key, pkhU8Vec);
    expect(
      Buffer.from(pkhKeyMap.get(pkhU8Vec)?.privateKey || "").toString("hex"),
    ).toEqual(Buffer.from(key.privateKey).toString("hex"));
  });

  test("remove", () => {
    pkhKeyMap.add(key, pkhU8Vec);
    pkhKeyMap.remove(pkhU8Vec);
    expect(
      Buffer.from(pkhKeyMap.get(pkhU8Vec)?.privateKey || "").toString("hex"),
    ).toEqual("");
  });

  test("get", () => {
    pkhKeyMap.add(key, pkhU8Vec);
    expect(
      Buffer.from(pkhKeyMap.get(pkhU8Vec)?.privateKey || "").toString("hex"),
    ).toEqual(Buffer.from(key.privateKey).toString("hex"));
  });

  test("values method should return all Key values", () => {
    const key1 = key;
    const key2 = KeyPair.fromRandom();
    const pkh2 = Pkh.fromPubKeyBuffer(Buffer.from(key2.publicKey));
    const pkhU8Vec2 = pkh2.buf;
    pkhKeyMap.add(key1, pkhU8Vec);
    pkhKeyMap.add(key2, pkhU8Vec2);

    const values = Array.from(pkhKeyMap.values());

    expect(values.length).toBe(2);
    expect(Buffer.from(values[0].privateKey).toString("hex")).toEqual(
      Buffer.from(key1.privateKey).toString("hex"),
    );
    expect(Buffer.from(values[1].privateKey).toString("hex")).toEqual(
      Buffer.from(key2.privateKey).toString("hex"),
    );
  });
});
