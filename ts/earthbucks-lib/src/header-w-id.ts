import { FixedBuf } from "@webbuf/fixedbuf";
import { Header } from "./header.js";

export class HeaderWId {
  id: FixedBuf<32>;
  header: Header;

  constructor(id: FixedBuf<32>, header: Header) {
    this.id = id;
    this.header = header;
  }

  static fromHeader(header: Header): HeaderWId {
    return new HeaderWId(header.id(), header);
  }
}
