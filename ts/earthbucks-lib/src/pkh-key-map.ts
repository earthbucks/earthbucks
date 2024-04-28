import KeyPair from "./key-pair";
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

  remove(pkhU8Vec: Buffer): void {
    const pkhHex = pkhU8Vec.toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhU8Vec: Buffer): KeyPair | undefined {
    const pkhHex = pkhU8Vec.toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
