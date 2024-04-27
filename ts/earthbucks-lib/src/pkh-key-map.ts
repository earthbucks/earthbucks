import KeyPair from "./key-pair";
import { Buffer } from "buffer";

export default class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkhU8Vec: Uint8Array): void {
    const pkhHex = Buffer.from(pkhU8Vec).toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhU8Vec: Uint8Array): void {
    const pkhHex = Buffer.from(pkhU8Vec).toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhU8Vec: Uint8Array): KeyPair | undefined {
    const pkhHex = Buffer.from(pkhU8Vec).toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
