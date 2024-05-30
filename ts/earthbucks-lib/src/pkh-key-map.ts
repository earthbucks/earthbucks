import { KeyPair } from "./key-pair.js";
import { EbxBuf } from "./ebx-buf.js";

export class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkhBuf: EbxBuf): void {
    const pkhHex = pkhBuf.toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhIsoBuf: EbxBuf): void {
    const pkhHex = pkhIsoBuf.toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhIsoBuf: EbxBuf): KeyPair | undefined {
    const pkhHex = pkhIsoBuf.toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
