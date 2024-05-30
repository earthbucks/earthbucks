import { KeyPair } from "./key-pair.js";
import { EbxBuffer } from "./ebx-buffer";

export class PkhKeyMap {
  public map: Map<string, KeyPair>;

  constructor() {
    this.map = new Map<string, KeyPair>();
  }

  add(key: KeyPair, pkhBuf: EbxBuffer): void {
    const pkhHex = pkhBuf.toString("hex");
    this.map.set(pkhHex, key);
  }

  remove(pkhIsoBuf: EbxBuffer): void {
    const pkhHex = pkhIsoBuf.toString("hex");
    this.map.delete(pkhHex);
  }

  get(pkhIsoBuf: EbxBuffer): KeyPair | undefined {
    const pkhHex = pkhIsoBuf.toString("hex");
    return this.map.get(pkhHex);
  }

  values(): IterableIterator<KeyPair> {
    return this.map.values();
  }
}
