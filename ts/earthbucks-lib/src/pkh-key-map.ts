import Key from "./key";
import { Buffer } from "buffer";

export default class PkhKeyMap {
  public map: Map<string, Key>;

  constructor() {
    this.map = new Map<string, Key>();
  }

  add(key: Key, pkhU8Vec: Uint8Array): void {
    const pkhHex = Buffer.from(pkhU8Vec).toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhU8Vec: Uint8Array): void {
    const pkhHex = Buffer.from(pkhU8Vec).toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhU8Vec: Uint8Array): Key | undefined {
    const pkhHex = Buffer.from(pkhU8Vec).toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<Key> {
    return this.map.values();
  }
}
