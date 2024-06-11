import { InvalidSizeError } from "./error.js";
import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { SysBuf, FixedBuf } from "./buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";

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
      throw new InvalidSizeError();
    }
    const reader = new BufReader(buf);
    const randValue = reader.readFixed(32);
    const timestamp = reader.readU64BE();
    return new PermissionToken(randValue, timestamp);
  }

  static fromRandom(): PermissionToken {
    const randValue: FixedBuf<32> = (FixedBuf<32>).fromBuf(
      32,
      crypto.getRandomValues(SysBuf.alloc(32)),
    );
    const timestamp = new U64(Date.now()); // milliseconds
    return new PermissionToken(randValue, timestamp);
  }

  isValid(): boolean {
    return Date.now() - Number(this.timestamp) < 15 * 60 * 1000; // 15 minutes
  }
}
