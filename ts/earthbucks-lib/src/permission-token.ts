import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class PermissionToken {
  randValue: FixedIsoBuf<32>;
  timestamp: U64; // milliseconds

  constructor(randValue: FixedIsoBuf<32>, timestamp: U64) {
    this.randValue = randValue;
    this.timestamp = timestamp; // milliseconds
  }

  toIsoBuf(): SysBuf {
    const writer = new IsoBufWriter();
    writer.write(this.randValue);
    writer.writeU64BE(this.timestamp);
    return writer.toIsoBuf();
  }

  static fromIsoBuf(buf: SysBuf): Result<PermissionToken, string> {
    try {
      if (buf.length !== 32 + 8) {
        return Err("invalid buffer length");
      }
      const reader = new IsoBufReader(buf);
      const randValue = reader
        .readFixed(32)
        .mapErr((err) => `Unable to read rand value: ${err}`)
        .unwrap();
      const timestamp = reader
        .readU64BE()
        .mapErr((err) => `Unable to read timestamp: ${err}`)
        .unwrap();
      return Ok(new PermissionToken(randValue, timestamp));
    } catch (err) {
      return Err(err?.toString() || "Unknown error parsing permission token");
    }
  }

  static fromRandom(): PermissionToken {
    const randValue: FixedIsoBuf<32> = (FixedIsoBuf<32>)
      .fromBuf(32, crypto.getRandomValues(SysBuf.alloc(32)))
      .unwrap();
    const timestamp = new U64(Date.now()); // milliseconds
    return new PermissionToken(randValue, timestamp);
  }

  isValid(): boolean {
    return Date.now() - Number(this.timestamp) < 15 * 60 * 1000; // 15 minutes
  }
}
