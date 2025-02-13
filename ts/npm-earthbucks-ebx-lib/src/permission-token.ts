import { U64BE } from "@webbuf/numbers";
import { FixedBuf } from "@webbuf/fixedbuf";
import { BufWriter } from "@webbuf/rw";
import { BufReader } from "@webbuf/rw";
import type { WebBuf } from "@webbuf/webbuf";

export class PermissionToken {
  randValue: FixedBuf<32>;
  timestamp: U64BE; // milliseconds

  constructor(randValue: FixedBuf<32>, timestamp: U64BE) {
    this.randValue = randValue;
    this.timestamp = timestamp; // milliseconds
  }

  toBuf(): WebBuf {
    const writer = new BufWriter();
    writer.write(this.randValue.buf);
    writer.writeU64BE(this.timestamp);
    return writer.toBuf();
  }

  static fromBuf(buf: WebBuf): PermissionToken {
    if (buf.length !== 32 + 8) {
      throw new Error("invalid size error");
    }
    const reader = new BufReader(buf);
    const randValue = reader.readFixed(32);
    const timestamp = reader.readU64BE();
    return new PermissionToken(randValue, timestamp);
  }

  static fromRandom(): PermissionToken {
    const randValue: FixedBuf<32> = FixedBuf.fromRandom(32);
    const timestamp = new U64BE(Date.now()); // milliseconds
    return new PermissionToken(randValue, timestamp);
  }

  isValid(): boolean {
    return Date.now() - this.timestamp.n < 15 * 60 * 1000; // 15 minutes
  }
}
