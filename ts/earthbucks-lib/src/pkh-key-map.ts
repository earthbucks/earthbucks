import { KeyPair } from "./key-pair.js";
import { IsoBuf } from "./iso-buf.js";

export class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkhBuf: IsoBuf): void {
    const pkhHex = pkhBuf.toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhIsoBuf: IsoBuf): void {
    const pkhHex = pkhIsoBuf.toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhIsoBuf: IsoBuf): KeyPair | undefined {
    const pkhHex = pkhIsoBuf.toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
