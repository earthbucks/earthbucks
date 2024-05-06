import IsoBufReader from "../iso-buf-reader";
import IsoBufWriter from "../iso-buf-writer";

export default class PermissionToken {
  randValue: Buffer;
  timestamp: bigint; // milliseconds

  constructor(randValue: Buffer, timestamp: bigint) {
    this.randValue = randValue;
    this.timestamp = timestamp; // milliseconds
  }

  toIsoBuf(): Buffer {
    const writer = new IsoBufWriter();
    writer.writeBuffer(this.randValue);
    writer.writeUInt64BEBigInt(this.timestamp);
    return writer.toIsoBuf();
  }

  static fromIsoBuf(buf: Buffer): PermissionToken {
    if (buf.length !== 32 + 8) {
      throw new Error("invalid buffer length");
    }
    const reader = new IsoBufReader(buf);
    const randValue = reader.readBuffer(32);
    const timestamp = reader.readUInt64BEBigInt();
    return new PermissionToken(randValue, timestamp);
  }

  static fromRandom(): PermissionToken {
    const randValue = crypto.getRandomValues(new Uint8Array(32));
    const timestamp = BigInt(Date.now()); // milliseconds
    return new PermissionToken(Buffer.from(randValue), timestamp);
  }

  isValid(): boolean {
    return Date.now() - Number(this.timestamp) < 15 * 60 * 1000; // 15 minutes
  }
}
