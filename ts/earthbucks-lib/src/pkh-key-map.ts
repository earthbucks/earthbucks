import { KeyPair } from "./key-pair.js";
import { SysBuf } from "./buf.js";

export class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkhBuf: SysBuf): void {
    const pkhHex = pkhBuf.toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhEbxBuf: SysBuf): void {
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
