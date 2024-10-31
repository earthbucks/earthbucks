import type { KeyPair } from "./key-pair.js";
import { Pkh } from "./pkh.js";

export class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkh: Pkh) {
    const pkhHex = pkh.toHex();
    this.map.set(pkhHex, key);
  }

  remove(pkh: Pkh) {
    const pkhHex = pkh.toHex();
    this.map.delete(pkhHex);
  }

  get(pkh: Pkh): KeyPair | undefined {
    const pkhHex = pkh.toHex();
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
