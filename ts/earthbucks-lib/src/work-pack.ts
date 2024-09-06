import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { EbxBuf, SysBuf } from "./buf.js";
import { Header } from "./header.js";
import { Lch10Ids } from "./lch10-ids.js";

export class WorkPack {
  header: Header;
  lch10Ids: Lch10Ids;

  constructor(header: Header, lch10Ids: Lch10Ids) {
    this.header = header;
    this.lch10Ids = lch10Ids;
  }

  toBufWriter(bw: BufWriter = new BufWriter()): BufWriter {
    bw.write(this.header.toBuf());
    bw.write(this.lch10Ids.toBuf());
    return bw;
  }

  static fromBufReader(br: BufReader): WorkPack {
    const header = Header.fromBufReader(br);
    const lch10Ids = Lch10Ids.fromBufReader(br);
    return new WorkPack(header, lch10Ids);
  }

  toBuf(): SysBuf {
    return SysBuf.concat([this.header.toBuf(), this.lch10Ids.toBuf()]);
  }

  static fromBuf(buf: SysBuf): WorkPack {
    const br = new BufReader(buf);
    const header = Header.fromBufReader(br);
    const lch10Ids = Lch10Ids.fromBufReader(br);
    return new WorkPack(header, lch10Ids);
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromHex(hex: string): WorkPack {
    const buf = EbxBuf.fromHex(hex.length / 2, hex);
    return WorkPack.fromBuf(buf.buf);
  }
}
