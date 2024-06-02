import { Header } from "./header.js";

export class HeaderChain {
  headers: Header[];

  constructor(headers: Header[]) {
    this.headers = headers;
  }

  add(header: Header) {
    this.headers.push(header);
  }

  getTip(): Header | void {
    const header = this.headers[this.headers.length - 1];
    if (header) {
      return header;
    } else {
      return;
    }
  }

  // newHeaderIsValidAt(timestamp: bigint): boolean {
  //   return this.headers.isValidAt(timestamp);
  // }
}
