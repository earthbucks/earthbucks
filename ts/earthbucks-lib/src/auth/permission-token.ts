import BufferReader from "../buffer-reader";
import BufferWriter from "../buffer-writer";

export default class PermissionToken {
  randValue: Buffer;
  timestamp: bigint; // milliseconds

  constructor(randValue: Buffer, timestamp: bigint) {
    this.randValue = randValue;
    this.timestamp = timestamp; // milliseconds
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter();
    writer.writeBuffer(this.randValue);
    writer.writeUInt64BEBigInt(this.timestamp);
    return writer.toBuffer();
  }

  static fromBuffer(buf: Buffer): PermissionToken {
    if (buf.length !== 32 + 8) {
      throw new Error("invalid buffer length");
    }
    const reader = new BufferReader(buf);
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
