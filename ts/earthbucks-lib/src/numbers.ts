import { EbxBuf, WebBuf } from "./buf.js";

export abstract class BasicNumber<U extends BasicNumber<U>> {
  protected value: bigint;
  protected min: bigint;
  protected max: bigint;

  constructor(value: bigint | number, min: bigint, max: bigint) {
    const valueBn = BigInt(value);
    if (valueBn < min || valueBn > max) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    this.value = valueBn;
    this.min = min;
    this.max = max;
  }

  abstract add(other: U): U;
  abstract sub(other: U): U;
  abstract mul(other: U): U;
  abstract div(other: U): U;
  abstract get bn(): bigint;
  abstract get n(): number;
  abstract toBEBuf(): WebBuf;
  abstract toHex(): string;
}

export class U8 extends BasicNumber<U8> {
  readonly _U8: undefined;

  constructor(value: bigint | number) {
    super(value, 0x00n, 0xffn);
  }

  add(other: U8): U8 {
    const result = this.value + other.value;
    return new U8(result);
  }

  sub(other: U8): U8 {
    const result = this.value - other.value;
    return new U8(result);
  }

  mul(other: U8): U8 {
    const result = this.value * other.value;
    return new U8(result);
  }

  div(other: U8): U8 {
    const result = this.value / other.value;
    return new U8(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
  }

  toBEBuf(): WebBuf {
    const buf = WebBuf.alloc(1);
    buf.writeUInt8(this.n, 0);
    return buf;
  }

  toHex(): string {
    return this.toBEBuf().toString("hex");
  }

  static fromBEBuf(buf: WebBuf): U8 {
    return new U8(buf.readUInt8(0));
  }

  static fromHex(hex: string): U8 {
    return U8.fromBEBuf(EbxBuf.fromHex(1, hex).buf);
  }
}

export class U16 extends BasicNumber<U16> {
  readonly _U16: undefined;

  constructor(value: bigint | number) {
    super(value, 0x0000n, 0xffffn);
  }

  add(other: U16): U16 {
    const result = this.value + other.value;
    return new U16(result);
  }

  sub(other: U16): U16 {
    const result = this.value - other.value;
    return new U16(result);
  }

  mul(other: U16): U16 {
    const result = this.value * other.value;
    return new U16(result);
  }

  div(other: U16): U16 {
    const result = this.value / other.value;
    return new U16(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
  }

  toBEBuf(): WebBuf {
    const buf = WebBuf.alloc(2);
    buf.writeUInt16BE(this.n, 0);
    return buf;
  }

  toHex(): string {
    return this.toBEBuf().toString("hex");
  }

  static fromBEBuf(buf: WebBuf): U16 {
    return new U16(buf.readUInt16BE(0));
  }

  static fromHex(hex: string): U16 {
    return U16.fromBEBuf(EbxBuf.fromHex(2, hex).buf);
  }
}

export class U32 extends BasicNumber<U32> {
  readonly _U32: undefined;

  constructor(value: bigint | number) {
    super(value, 0x00000000n, 0xffffffffn);
  }

  add(other: U32): U32 {
    const result = this.value + other.value;
    return new U32(result);
  }

  sub(other: U32): U32 {
    const result = this.value - other.value;
    return new U32(result);
  }

  mul(other: U32): U32 {
    const result = this.value * other.value;
    return new U32(result);
  }

  div(other: U32): U32 {
    const result = this.value / other.value;
    return new U32(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
  }

  toBEBuf(): WebBuf {
    const buf = WebBuf.alloc(4);
    buf.writeUInt32BE(this.n, 0);
    return buf;
  }

  toHex(): string {
    return this.toBEBuf().toString("hex");
  }

  static fromBEBuf(buf: WebBuf): U32 {
    return new U32(buf.readUInt32BE(0));
  }

  static fromHex(hex: string): U32 {
    return U32.fromBEBuf(EbxBuf.fromHex(4, hex).buf);
  }
}

export class U64 extends BasicNumber<U64> {
  readonly _U64: undefined;

  constructor(value: bigint | number) {
    super(value, 0x0000000000000000n, 0xffffffffffffffffn);
  }

  add(other: U64): U64 {
    const result = this.value + other.value;
    return new U64(result);
  }

  sub(other: U64): U64 {
    const result = this.value - other.value;
    return new U64(result);
  }

  mul(other: U64): U64 {
    const result = this.value * other.value;
    return new U64(result);
  }

  div(other: U64): U64 {
    const result = this.value / other.value;
    return new U64(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
  }

  toBEBuf(): WebBuf {
    const buf = WebBuf.alloc(8);
    buf.writeBigInt64BE(this.bn);
    return buf;
  }

  toHex(): string {
    return this.toBEBuf().toString("hex");
  }

  static fromBEBuf(buf: WebBuf): U64 {
    return new U64(buf.readBigUInt64BE(0));
  }

  static fromHex(hex: string): U64 {
    return U64.fromBEBuf(EbxBuf.fromHex(8, hex).buf);
  }
}

export class U128 extends BasicNumber<U128> {
  readonly _U128: undefined;

  constructor(value: bigint | number) {
    super(
      value,
      0x00000000000000000000000000000000n,
      0xffffffffffffffffffffffffffffffffn,
    );
  }

  add(other: U128): U128 {
    const result = this.value + other.value;
    return new U128(result);
  }

  sub(other: U128): U128 {
    const result = this.value - other.value;
    return new U128(result);
  }

  mul(other: U128): U128 {
    const result = this.value * other.value;
    return new U128(result);
  }

  div(other: U128): U128 {
    const result = this.value / other.value;
    return new U128(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
  }

  toBEBuf(): WebBuf {
    const val1: bigint = this.bn >> 64n;
    const val2: bigint = this.bn & 0xffffffffffffffffn;
    const buf = WebBuf.alloc(16);
    buf.writeBigUInt64BE(val1, 0);
    buf.writeBigUInt64BE(val2, 8);
    return buf;
  }

  toHex(): string {
    return this.toBEBuf().toString("hex");
  }

  static fromBEBuf(buf: WebBuf): U128 {
    const val1: bigint = buf.readBigUInt64BE(0);
    const val2: bigint = buf.readBigUInt64BE(8);
    return new U128((val1 << 64n) + val2);
  }

  static fromHex(hex: string): U128 {
    const buf = EbxBuf.fromHex(16, hex).buf;
    return U128.fromBEBuf(buf);
  }
}

export class U256 extends BasicNumber<U256> {
  readonly _U256: undefined;

  constructor(value: bigint | number) {
    super(
      value,
      0x0000000000000000000000000000000000000000000000000000000000000000n,
      0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
    );
  }

  add(other: U256): U256 {
    const result = this.value + other.value;
    return new U256(result);
  }

  sub(other: U256): U256 {
    const result = this.value - other.value;
    return new U256(result);
  }

  mul(other: U256): U256 {
    const result = this.value * other.value;
    return new U256(result);
  }

  div(other: U256): U256 {
    const result = this.value / other.value;
    return new U256(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
  }

  toBEBuf(): WebBuf {
    const val1: bigint = this.bn >> 192n;
    const val2: bigint = (this.bn >> 128n) & 0xffffffffffffffffn;
    const val3: bigint = (this.bn >> 64n) & 0xffffffffffffffffn;
    const val4: bigint = this.bn & 0xffffffffffffffffn;
    const buf = WebBuf.alloc(32);
    buf.writeBigUInt64BE(val1, 0);
    buf.writeBigUInt64BE(val2, 8);
    buf.writeBigUInt64BE(val3, 16);
    buf.writeBigUInt64BE(val4, 24);
    return buf;
  }

  toHex(): string {
    return this.toBEBuf().toString("hex");
  }

  static fromBEBuf(buf: WebBuf): U256 {
    const val1: bigint = buf.readBigUInt64BE(0);
    const val2: bigint = buf.readBigUInt64BE(8);
    const val3: bigint = buf.readBigUInt64BE(16);
    const val4: bigint = buf.readBigUInt64BE(24);
    return new U256((val1 << 192n) + (val2 << 128n) + (val3 << 64n) + val4);
  }

  static fromHex(hex: string): U256 {
    const buf = EbxBuf.fromHex(32, hex).buf;
    return U256.fromBEBuf(buf);
  }
}
