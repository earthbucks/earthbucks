import type { KeyPair } from "./key-pair.js";
import type { SysBuf } from "./buf.js";

export class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkhBuf: SysBuf) {
    const pkhHex = pkhBuf.toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhEbxBuf: SysBuf) {
    const pkhHex = pkhEbxBuf.toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhEbxBuf: SysBuf): KeyPair | undefined {
    const pkhHex = pkhEbxBuf.toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
