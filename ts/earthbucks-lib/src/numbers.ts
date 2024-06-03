export abstract class BasicNumber<U extends BasicNumber<U>> {
  protected value: bigint;

  constructor(
    value: bigint | number,
    protected min: bigint,
    protected max: bigint,
  ) {
    if (typeof value === "number") {
      value = BigInt(value);
    }
    if (value < min || value > max) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    this.value = value;
  }

  abstract add(other: U): U;
  abstract sub(other: U): U;
  abstract mul(other: U): U;
  abstract div(other: U): U;
  abstract get bn(): bigint;
  abstract get n(): number;
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
}

export class I8 extends BasicNumber<I8> {
  readonly _I8: undefined;

  constructor(value: bigint | number) {
    super(value, -0x80n, 0x7fn);
  }

  add(other: I8): I8 {
    const result = this.value + other.value;
    return new I8(result);
  }

  sub(other: I8): I8 {
    const result = this.value - other.value;
    return new I8(result);
  }

  mul(other: I8): I8 {
    const result = this.value * other.value;
    return new I8(result);
  }

  div(other: I8): I8 {
    const result = this.value / other.value;
    return new I8(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
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
}

export class I16 extends BasicNumber<I16> {
  readonly _I16: undefined;

  constructor(value: bigint | number) {
    super(value, -0x8000n, 0x7fffn);
  }

  add(other: I16): I16 {
    const result = this.value + other.value;
    return new I16(result);
  }

  sub(other: I16): I16 {
    const result = this.value - other.value;
    return new I16(result);
  }

  mul(other: I16): I16 {
    const result = this.value * other.value;
    return new I16(result);
  }

  div(other: I16): I16 {
    const result = this.value / other.value;
    return new I16(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
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
}

export class I32 extends BasicNumber<I32> {
  readonly _I32: undefined;

  constructor(value: bigint | number) {
    super(value, -0x80000000n, 0x7fffffffn);
  }

  add(other: I32): I32 {
    const result = this.value + other.value;
    return new I32(result);
  }

  sub(other: I32): I32 {
    const result = this.value - other.value;
    return new I32(result);
  }

  mul(other: I32): I32 {
    const result = this.value * other.value;
    return new I32(result);
  }

  div(other: I32): I32 {
    const result = this.value / other.value;
    return new I32(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
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
}

export class I64 extends BasicNumber<I64> {
  readonly _I64: undefined;

  constructor(value: bigint | number) {
    super(value, -0x8000000000000000n, 0x7fffffffffffffffn);
  }

  add(other: I64): I64 {
    const result = this.value + other.value;
    return new I64(result);
  }

  sub(other: I64): I64 {
    const result = this.value - other.value;
    return new I64(result);
  }

  mul(other: I64): I64 {
    const result = this.value * other.value;
    return new I64(result);
  }

  div(other: I64): I64 {
    const result = this.value / other.value;
    return new I64(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
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
}

export class I128 extends BasicNumber<I128> {
  readonly _I128: undefined;

  constructor(value: bigint | number) {
    super(
      value,
      -0x80000000000000000000000000000000n,
      0x7fffffffffffffffffffffffffffffffn,
    );
  }

  add(other: I128): I128 {
    const result = this.value + other.value;
    return new I128(result);
  }

  sub(other: I128): I128 {
    const result = this.value - other.value;
    return new I128(result);
  }

  mul(other: I128): I128 {
    const result = this.value * other.value;
    return new I128(result);
  }

  div(other: I128): I128 {
    const result = this.value / other.value;
    return new I128(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
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
}

export class I256 extends BasicNumber<I256> {
  readonly _I256: undefined;

  constructor(value: bigint | number) {
    super(
      value,
      -0x8000000000000000000000000000000000000000000000000000000000000000n,
      0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
    );
  }

  add(other: I256): I256 {
    const result = this.value + other.value;
    return new I256(result);
  }

  sub(other: I256): I256 {
    const result = this.value - other.value;
    return new I256(result);
  }

  mul(other: I256): I256 {
    const result = this.value * other.value;
    return new I256(result);
  }

  div(other: I256): I256 {
    const result = this.value / other.value;
    return new I256(result);
  }

  get bn(): bigint {
    return this.value;
  }

  get n(): number {
    return Number(this.value);
  }
}
