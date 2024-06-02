abstract class BasicNumber<T, U extends BasicNumber<T, U>> {
  protected value: T;

  constructor(
    value: T,
    protected min: T,
    protected max: T,
  ) {
    if (this.lessThan(value, min) || this.greaterThan(value, max)) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    this.value = value;
  }

  abstract add(other: U): U;
  abstract mul(other: U): U;
  abstract getValue(): T;
  protected abstract lessThan(a: T, b: T): boolean;
  protected abstract greaterThan(a: T, b: T): boolean;
}

export class U8 extends BasicNumber<number, U8> {
  constructor(value: number) {
    super(value, 0, 255);
  }

  add(other: U8): U8 {
    const result = this.value + other.value;
    return new U8(result);
  }

  mul(other: U8): U8 {
    const result = this.value * other.value;
    return new U8(result);
  }

  getValue(): number {
    return this.value;
  }

  protected lessThan(a: number, b: number): boolean {
    return a < b;
  }

  protected greaterThan(a: number, b: number): boolean {
    return a > b;
  }
}

export class I8 extends BasicNumber<number, I8> {
  constructor(value: number) {
    super(value, -128, 127);
  }

  add(other: I8): I8 {
    const result = this.value + other.value;
    return new I8(result);
  }

  mul(other: I8): I8 {
    const result = this.value * other.value;
    return new I8(result);
  }

  getValue(): number {
    return this.value;
  }

  protected lessThan(a: number, b: number): boolean {
    return a < b;
  }

  protected greaterThan(a: number, b: number): boolean {
    return a > b;
  }
}

export class U16 extends BasicNumber<number, U16> {
  constructor(value: number) {
    super(value, 0, 65535);
  }

  add(other: U16): U16 {
    const result = this.value + other.value;
    return new U16(result);
  }

  mul(other: U16): U16 {
    const result = this.value * other.value;
    return new U16(result);
  }

  getValue(): number {
    return this.value;
  }

  protected lessThan(a: number, b: number): boolean {
    return a < b;
  }

  protected greaterThan(a: number, b: number): boolean {
    return a > b;
  }
}

export class I16 extends BasicNumber<number, I16> {
  constructor(value: number) {
    super(value, -32768, 32767);
  }

  add(other: I16): I16 {
    const result = this.value + other.value;
    return new I16(result);
  }

  mul(other: I16): I16 {
    const result = this.value * other.value;
    return new I16(result);
  }

  getValue(): number {
    return this.value;
  }

  protected lessThan(a: number, b: number): boolean {
    return a < b;
  }

  protected greaterThan(a: number, b: number): boolean {
    return a > b;
  }
}

export class U32 extends BasicNumber<number, U32> {
  constructor(value: number) {
    super(value, 0, 4294967295);
  }

  add(other: U32): U32 {
    const result = this.value + other.value;
    return new U32(result);
  }

  mul(other: U32): U32 {
    const result = this.value * other.value;
    return new U32(result);
  }

  getValue(): number {
    return this.value;
  }

  protected lessThan(a: number, b: number): boolean {
    return a < b;
  }

  protected greaterThan(a: number, b: number): boolean {
    return a > b;
  }
}

export class I32 extends BasicNumber<number, I32> {
  constructor(value: number) {
    super(value, -2147483648, 2147483647);
  }

  add(other: I32): I32 {
    const result = this.value + other.value;
    return new I32(result);
  }

  mul(other: I32): I32 {
    const result = this.value * other.value;
    return new I32(result);
  }

  getValue(): number {
    return this.value;
  }

  protected lessThan(a: number, b: number): boolean {
    return a < b;
  }

  protected greaterThan(a: number, b: number): boolean {
    return a > b;
  }
}

export class U64 extends BasicNumber<bigint, U64> {
  constructor(value: bigint) {
    super(value, 0n, 18446744073709551615n);
  }

  add(other: U64): U64 {
    const result = this.value + other.value;
    return new U64(result);
  }

  mul(other: U64): U64 {
    const result = this.value * other.value;
    return new U64(result);
  }

  getValue(): bigint {
    return this.value;
  }

  protected lessThan(a: bigint, b: bigint): boolean {
    return a < b;
  }

  protected greaterThan(a: bigint, b: bigint): boolean {
    return a > b;
  }
}

export class I64 extends BasicNumber<bigint, I64> {
  constructor(value: bigint) {
    super(value, -9223372036854775808n, 9223372036854775807n);
  }

  add(other: I64): I64 {
    const result = this.value + other.value;
    return new I64(result);
  }

  mul(other: I64): I64 {
    const result = this.value * other.value;
    return new I64(result);
  }

  getValue(): bigint {
    return this.value;
  }

  protected lessThan(a: bigint, b: bigint): boolean {
    return a < b;
  }

  protected greaterThan(a: bigint, b: bigint): boolean {
    return a > b;
  }
}

export class U128 extends BasicNumber<bigint, U128> {
  constructor(value: bigint) {
    super(value, 0n, 340282366920938463463374607431768211455n);
  }

  add(other: U128): U128 {
    const result = this.value + other.value;
    return new U128(result);
  }

  mul(other: U128): U128 {
    const result = this.value * other.value;
    return new U128(result);
  }

  getValue(): bigint {
    return this.value;
  }

  protected lessThan(a: bigint, b: bigint): boolean {
    return a < b;
  }

  protected greaterThan(a: bigint, b: bigint): boolean {
    return a > b;
  }
}

export class I128 extends BasicNumber<bigint, I128> {
  constructor(value: bigint) {
    super(
      value,
      -170141183460469231731687303715884105728n,
      170141183460469231731687303715884105727n,
    );
  }

  add(other: I128): I128 {
    const result = this.value + other.value;
    return new I128(result);
  }

  mul(other: I128): I128 {
    const result = this.value * other.value;
    return new I128(result);
  }

  getValue(): bigint {
    return this.value;
  }

  protected lessThan(a: bigint, b: bigint): boolean {
    return a < b;
  }

  protected greaterThan(a: bigint, b: bigint): boolean {
    return a > b;
  }
}

export class U256 extends BasicNumber<bigint, U256> {
  constructor(value: bigint) {
    super(
      value,
      0n,
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
    );
  }

  add(other: U256): U256 {
    const result = this.value + other.value;
    return new U256(result);
  }

  mul(other: U256): U256 {
    const result = this.value * other.value;
    return new U256(result);
  }

  getValue(): bigint {
    return this.value;
  }

  protected lessThan(a: bigint, b: bigint): boolean {
    return a < b;
  }

  protected greaterThan(a: bigint, b: bigint): boolean {
    return a > b;
  }
}

export class I256 extends BasicNumber<bigint, I256> {
  constructor(value: bigint) {
    super(
      value,
      -57896044618658097711785492504343953926634992332820282019728792003956564819968n,
      57896044618658097711785492504343953926634992332820282019728792003956564819967n,
    );
  }

  add(other: I256): I256 {
    const result = this.value + other.value;
    return new I256(result);
  }

  mul(other: I256): I256 {
    const result = this.value * other.value;
    return new I256(result);
  }

  getValue(): bigint {
    return this.value;
  }

  protected lessThan(a: bigint, b: bigint): boolean {
    return a < b;
  }

  protected greaterThan(a: bigint, b: bigint): boolean {
    return a > b;
  }
}
