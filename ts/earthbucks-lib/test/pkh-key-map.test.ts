import { describe, expect, test, beforeEach, it } from "vitest";
import { PkhKeyMap } from "../src/pkh-key-map.js";
import { Pkh } from "../src/pkh.js";
import { KeyPair } from "../src/key-pair.js";
import { WebBuf } from "@webbuf/webbuf";

describe("PkhKeyMap", () => {
  let pkhKeyMap: PkhKeyMap;
  let key: KeyPair;
  let pkh: Pkh;
  let pkhBuf: WebBuf;

  beforeEach(() => {
    pkhKeyMap = new PkhKeyMap();
    key = KeyPair.fromRandom();
    pkh = Pkh.fromPubKeyBuf(key.pubKey.toBuf());
    pkhBuf = pkh.buf.buf;
  });

  test("add", () => {
    pkhKeyMap.add(key, pkh);
    expect(
      WebBuf.from(pkhKeyMap.get(pkh)?.privKey.toBuf().buf || "").toString(
        "hex",
      ),
    ).toEqual(WebBuf.from(key.privKey.toBuf().buf).toString("hex"));
  });

  test("remove", () => {
    pkhKeyMap.add(key, pkh);
    pkhKeyMap.remove(pkh);
    expect(
      WebBuf.from(pkhKeyMap.get(pkh)?.privKey.toBuf().buf || "").toString(
        "hex",
      ),
    ).toEqual("");
  });

  test("get", () => {
    pkhKeyMap.add(key, pkh);
    expect(
      WebBuf.from(pkhKeyMap.get(pkh)?.privKey.toBuf().buf || "").toString(
        "hex",
      ),
    ).toEqual(WebBuf.from(key.privKey.toBuf().buf).toString("hex"));
  });

  test("values method should return all Key values", () => {
    const key1 = key;
    const key2 = KeyPair.fromRandom();
    const pkh2 = Pkh.fromPubKeyBuf(key2.pubKey.toBuf());
    pkhKeyMap.add(key1, pkh);
    pkhKeyMap.add(key2, pkh2);

    const values = Array.from(pkhKeyMap.values());

    expect(values.length).toBe(2);
    expect(
      WebBuf.from((values[0] as KeyPair).privKey.toBuf().buf).toString("hex"),
    ).toEqual(WebBuf.from(key1.privKey.toBuf().buf).toString("hex"));
    expect(
      WebBuf.from((values[1] as KeyPair).privKey.toBuf().buf).toString("hex"),
    ).toEqual(WebBuf.from(key2.privKey.toBuf().buf).toString("hex"));
  });
});
