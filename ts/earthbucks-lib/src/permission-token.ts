import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBuf, FixedIsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";

export class PermissionToken {
  randValue: FixedIsoBuf<32>;
  timestamp: bigint; // milliseconds

  constructor(randValue: FixedIsoBuf<32>, timestamp: bigint) {
    this.randValue = randValue;
    this.timestamp = timestamp; // milliseconds
  }

  toIsoBuf(): IsoBuf {
    const writer = new IsoBufWriter();
    writer.write(this.randValue);
    writer.writeUInt64BE(this.timestamp);
    return writer.toIsoBuf();
  }

  static fromIsoBuf(buf: IsoBuf): Result<PermissionToken, string> {
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
      .fromIsoBuf(32, crypto.getRandomValues(IsoBuf.alloc(32)))
      .unwrap();
    const timestamp = BigInt(Date.now()); // milliseconds
    return new PermissionToken(randValue, timestamp);
  }

  isValid(): boolean {
    return Date.now() - Number(this.timestamp) < 15 * 60 * 1000; // 15 minutes
  }
}
