import { Buffer } from "buffer";

// big integers, positive or negative, encoded as big endian, two's complement

export default class ScriptNum {
  num: bigint;

  constructor(num: bigint = BigInt(0)) {
    this.num = num;
  }

  fromIsoBuf(buffer: Buffer): this {
    const isNegative = buffer[0] & 0x80; // Check if the sign bit is set
    if (isNegative) {
      // If the number is negative
      let invertedBuffer = Buffer.alloc(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        invertedBuffer[i] = ~buffer[i]; // Invert all bits
      }
      const invertedBigInt = BigInt("0x" + invertedBuffer.toString("hex"));
      this.num = -(invertedBigInt + 1n); // Add one and negate to get the original number
    } else {
      // If the number is positive
      this.num = BigInt("0x" + buffer.toString("hex"));
    }
    return this;
  }

  static fromIsoBuf(buffer: Buffer): ScriptNum {
    return new ScriptNum().fromIsoBuf(buffer);
  }

  toIsoBuf(): Buffer {
    const num = this.num;
    if (num >= 0n) {
      let hex = num.toString(16);
      if (hex.length % 2 !== 0) {
        hex = "0" + hex; // Pad with zero to make length even
      }
      // If the most significant bit is set, add an extra zero byte at the start
      if (parseInt(hex[0], 16) >= 8) {
        hex = "00" + hex;
      }
      return Buffer.from(hex, "hex");
    } else {
      const bitLength = num.toString(2).length; // Get bit length of number
      const byteLength = Math.ceil(bitLength / 8); // Calculate byte length, rounding up to nearest byte
      const twosComplement = 2n ** BigInt(8 * byteLength) + num; // Calculate two's complement
      let hex = twosComplement.toString(16);
      if (hex.length % 2 !== 0) {
        hex = "0" + hex; // Pad with zero to make length even
      }
      return Buffer.from(hex, "hex");
    }
  }

  toIsoStr(): string {
    return this.num.toString();
  }

  fromIsoStr(str: string): this {
    this.num = BigInt(str);
    return this;
  }

  static fromIsoStr(str: string): ScriptNum {
    return new ScriptNum().fromIsoStr(str);
  }

  toU32(): number {
    return Number(this.num);
  }
}
