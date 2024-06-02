export class U8 {
  private value: number;

  constructor(value: number) {
    if (value < 0 || value > 255) {
      throw new Error(`Value ${value} is not a valid u8`);
    }
    this.value = value;
  }

  add(other: U8): U8 {
    return new U8(this.value + other.value);
  }

  mul(other: U8): U8 {
    return new U8(this.value * other.value);
  }

  getValue(): number {
    return this.value;
  }
}

export class I8 {
  private value: number;

  constructor(value: number) {
    if (value < -128 || value > 127) {
      throw new Error(`Value ${value} is not a valid i8`);
    }
    this.value = value;
  }

  add(other: I8): I8 {
    return new I8(this.value + other.value);
  }

  mul(other: I8): I8 {
    return new I8(this.value * other.value);
  }

  getValue(): number {
    return this.value;
  }
}

export class U16 {
  private value: number;

  constructor(value: number) {
    if (value < 0 || value > 65535) {
      throw new Error(`Value ${value} is not a valid u16`);
    }
    this.value = value;
  }

  add(other: U16): U16 {
    return new U16(this.value + other.value);
  }

  mul(other: U16): U16 {
    return new U16(this.value * other.value);
  }

  getValue(): number {
    return this.value;
  }
}

export class I16 {
  private value: number;

  constructor(value: number) {
    if (value < -32768 || value > 32767) {
      throw new Error(`Value ${value} is not a valid i16`);
    }
    this.value = value;
  }

  add(other: I16): I16 {
    return new I16(this.value + other.value);
  }

  mul(other: I16): I16 {
    return new I16(this.value * other.value);
  }

  getValue(): number {
    return this.value;
  }
}

export class U32 {
  private value: number;

  constructor(value: number) {
    if (value < 0 || value > 4294967295) {
      throw new Error(`Value ${value} is not a valid u32`);
    }
    this.value = value;
  }

  add(other: U32): U32 {
    return new U32(this.value + other.value);
  }

  mul(other: U32): U32 {
    return new U32(this.value * other.value);
  }

  getValue(): number {
    return this.value;
  }
}

export class I32 {
  private value: number;

  constructor(value: number) {
    if (value < -2147483648 || value > 2147483647) {
      throw new Error(`Value ${value} is not a valid i32`);
    }
    this.value = value;
  }

  add(other: I32): I32 {
    return new I32(this.value + other.value);
  }

  mul(other: I32): I32 {
    return new I32(this.value * other.value);
  }

  getValue(): number {
    return this.value;
  }
}

export class U64 {
  private value: bigint;

  constructor(value: bigint) {
    if (value < 0n || value > 18446744073709551615n) {
      throw new Error(`Value ${value} is not a valid u64`);
    }
    this.value = value;
  }

  add(other: U64): U64 {
    return new U64(this.value + other.value);
  }

  mul(other: U64): U64 {
    return new U64(this.value * other.value);
  }

  getValue(): bigint {
    return this.value;
  }
}

export class I64 {
  private value: bigint;

  constructor(value: bigint) {
    if (value < -9223372036854775808n || value > 9223372036854775807n) {
      throw new Error(`Value ${value} is not a valid i64`);
    }
    this.value = value;
  }

  add(other: I64): I64 {
    return new I64(this.value + other.value);
  }

  mul(other: I64): I64 {
    return new I64(this.value * other.value);
  }

  getValue(): bigint {
    return this.value;
  }
}

export class U128 {
  private value: bigint;

  constructor(value: bigint) {
    if (value < 0n || value > 340282366920938463463374607431768211455n) {
      throw new Error(`Value ${value} is not a valid u128`);
    }
    this.value = value;
  }

  add(other: U128): U128 {
    return new U128(this.value + other.value);
  }

  mul(other: U128): U128 {
    return new U128(this.value * other.value);
  }

  getValue(): bigint {
    return this.value;
  }
}

export class I128 {
  private value: bigint;

  constructor(value: bigint) {
    if (
      value < -170141183460469231731687303715884105728n ||
      value > 170141183460469231731687303715884105727n
    ) {
      throw new Error(`Value ${value} is not a valid i128`);
    }
    this.value = value;
  }

  add(other: I128): I128 {
    return new I128(this.value + other.value);
  }

  mul(other: I128): I128 {
    return new I128(this.value * other.value);
  }

  getValue(): bigint {
    return this.value;
  }
}

export class U256 {
  private value: bigint;

  constructor(value: bigint) {
    if (
      value < 0n ||
      value >
        115792089237316195423570985008687907853269984665640564039457584007913129639935n
    ) {
      throw new Error(`Value ${value} is not a valid u256`);
    }
    this.value = value;
  }

  add(other: U256): U256 {
    return new U256(this.value + other.value);
  }

  mul(other: U256): U256 {
    return new U256(this.value * other.value);
  }

  getValue(): bigint {
    return this.value;
  }
}

export class I256 {
  private value: bigint;

  constructor(value: bigint) {
    if (
      value <
        -57896044618658097711785492504343953926634992332820282019728792003956564819968n ||
      value >
        57896044618658097711785492504343953926634992332820282019728792003956564819967n
    ) {
      throw new Error(`Value ${value} is not a valid i256`);
    }
    this.value = value;
  }

  add(other: I256): I256 {
    return new I256(this.value + other.value);
  }

  mul(other: I256): I256 {
    return new I256(this.value * other.value);
  }

  getValue(): bigint {
    return this.value;
  }
}
