import KeyPair from "./key-pair.js";
import { Buffer } from "buffer";

export default class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkhBuf: Buffer): void {
    const pkhHex = pkhBuf.toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhIsoBuf: Buffer): void {
    const pkhHex = pkhIsoBuf.toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhIsoBuf: Buffer): KeyPair | undefined {
    const pkhHex = pkhIsoBuf.toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
