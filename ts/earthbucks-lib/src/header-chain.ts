import { Header } from "./header.ts";
import { Pkh } from "./pkh.ts";
import { Script } from "./script.ts";
import { ScriptChunk } from "./script-chunk.ts";
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
