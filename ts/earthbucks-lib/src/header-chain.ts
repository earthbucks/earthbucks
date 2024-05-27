import { Header } from "./header.js";
import { Pkh } from "./pkh.js";
import { Script } from "./script.js";
import { ScriptChunk } from "./script-chunk.js";
import { Option, Some, None } from "earthbucks-opt-res";

export class HeaderChain {
  headers: Header[];

  constructor(headers: Header[]) {
    this.headers = headers;
  }

  add(header: Header) {
    this.headers.push(header);
  }

  getTip(): Option<Header> {
    const header = this.headers[this.headers.length - 1];
    if (header) {
      return Some(header);
    } else {
      return None;
    }
  }

  // newHeaderIsValidAt(timestamp: bigint): boolean {
  //   return this.headers.isValidAt(timestamp);
  // }
}
