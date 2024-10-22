import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { FixedBuf } from "./buf.js";
import { WebBuf } from "./buf.js";
import { VarInt } from "./var-int.js";
import { EbxBuf } from "./buf.js";

// LCH: Longest Chain Headers
// LCH10Ids is a list of 10 most recent header IDs in chronological order.
export class Lch10Ids {
  ids: FixedBuf<32>[];

  constructor(ids: FixedBuf<32>[]) {
    if (ids.length > 10) {
      throw new Error("Lch10Ids: ids.length must be <= 10");
    }
    this.ids = ids;
  }

  toBufWriter(bw: BufWriter = new BufWriter()): BufWriter {
    const varInt = VarInt.fromNumber(this.ids.length);
    bw.write(varInt.toBuf());
    for (const id of this.ids) {
      bw.write(id.buf);
    }
    return bw;
  }

  static fromBufReader(br: BufReader): Lch10Ids {
    const idsLength = VarInt.fromBufReader(br).toU64().n;
    const ids: FixedBuf<32>[] = [];
    for (let i = 0; i < idsLength; i++) {
      const buf = br.read(32);
      const id = FixedBuf.fromBuf(32, buf);
      ids.push(id);
    }
    return new Lch10Ids(ids);
  }

  toBuf(): WebBuf {
    const varInt = VarInt.fromNumber(this.ids.length);
    const idsBuf = WebBuf.concat(this.ids.map((id) => id.buf));
    return WebBuf.concat([varInt.toBuf(), idsBuf]);
  }

  static fromBuf(buf: WebBuf): Lch10Ids {
    const br = new BufReader(buf);
    const idsLength = VarInt.fromBufReader(br).toU64().n;
    const ids: FixedBuf<32>[] = [];
    for (let i = 0; i < idsLength; i++) {
      const buf = br.read(32);
      const id = FixedBuf.fromBuf(32, buf);
      ids.push(id);
    }
    return new Lch10Ids(ids);
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromHex(hex: string): Lch10Ids {
    const buf = EbxBuf.fromHex(hex.length / 2, hex).buf;
    return Lch10Ids.fromBuf(buf);
  }
}
