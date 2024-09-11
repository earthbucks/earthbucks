import { U64 } from "./numbers.js";
import { FixedBuf } from "./buf.js";
import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import type { SysBuf } from "./buf.js";

export class PermissionToken {
  randValue: FixedBuf<32>;
  timestamp: U64; // milliseconds

  constructor(randValue: FixedBuf<32>, timestamp: U64) {
    this.randValue = randValue;
    this.timestamp = timestamp; // milliseconds
  }

  toBuf(): SysBuf {
    const writer = new BufWriter();
    writer.write(this.randValue.buf);
    writer.writeU64BE(this.timestamp);
    return writer.toBuf();
  }

  static fromBuf(buf: SysBuf): PermissionToken {
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
    const timestamp = new U64(Date.now()); // milliseconds
    return new PermissionToken(randValue, timestamp);
  }

  isValid(): boolean {
    return Date.now() - this.timestamp.n < 15 * 60 * 1000; // 15 minutes
  }
}
