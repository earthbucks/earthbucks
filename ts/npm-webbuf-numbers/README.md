# @webbuf/numbers

`@webbuf/numbers` is a TypeScript/JavaScript library for working with fixed-size
unsigned integers. This library provides support for several unsigned integer
types (e.g., `U8`, `U16`, `U32`, `U64`, `U128`, `U256`) and allows users to
perform common mathematical operations.

Signed integers and floating-point support are planned for future releases.

## Installation

You can install the package from npm:

```bash
npm install @webbuf/numbers
```

## Usage

The `@webbuf/numbers` package provides classes for fixed-size unsigned integers.
Each class supports the following features:

- **Basic arithmetic operations**: `add`, `sub`, `mul`, `div`
- **BigInt conversion**: Convert to and from `BigInt`
- **Binary data encoding**: Convert to and from big-endian and little-endian
  formats
- **Hexadecimal conversion**: Convert to and from hexadecimal strings

### Importing the Package

```typescript
import { U8, U16, U32, U64, U128, U256 } from "@webbuf/numbers";
```

### Creating Unsigned Integers

You can create instances from `BigInt` or `number` values using the `fromBn` and
`fromN` static methods, respectively. Note that numbers are automatically
converted to `BigInt` and may lose precision.

```typescript
const uint8 = U8.fromN(255);
const uint64 = U64.fromBn(1024n);
```

### Converting to BigInt

Use the `toBn()` method to retrieve the value as a `BigInt`:

```typescript
const bigIntValue = uint64.toBn(); // 1024n
```

### Arithmetic Operations

Each class supports basic arithmetic operations such as addition, subtraction,
multiplication, and division.

```typescript
const a = U16.fromN(1000);
const b = U16.fromN(500);
const result = a.add(b); // U16 instance with value 1500
```

### Encoding to and from Buffers

For applications needing binary encoding, use the `toBEBuf()` and `toLEBuf()`
methods to convert to big-endian and little-endian formats, respectively.

```typescript
const buffer = uint16.toBEBuf(); // Big-endian representation
const uint16FromBuf = U16.fromBEBuf(buffer); // Reconstructed from buffer
```

### Hexadecimal Representation

Each integer class can convert to and from hexadecimal strings:

```typescript
const hexString = uint32.toHex(); // Hexadecimal string representation
const uint32FromHex = U32.fromHex(hexString); // Reconstruct from hex
```

## API Documentation

### FixedNum (Abstract Class)

The `FixedNum` abstract class provides a foundation for unsigned integer classes
and defines the following core methods and properties:

- **Constructor**: Initializes an instance with a buffer of fixed size.
- **toBn()**: Converts the instance value to `BigInt`.
- **add(other: FixedNum<N>)**: Adds another instance of the same type.
- **sub(other: FixedNum<N>)**: Subtracts another instance of the same type.
- **mul(other: FixedNum<N>)**: Multiplies by another instance of the same type.
- **div(other: FixedNum<N>)**: Divides by another instance of the same type.
- **toBEBuf()**: Returns a big-endian `FixedBuf`.
- **toLEBuf()**: Returns a little-endian `FixedBuf`.
- **toHex()**: Returns a hexadecimal string of the value.

### U8, U16, U32, U64, U128, U256

Each of these classes extends `FixedNum` with specific byte lengths:

- **U8**: 8-bit unsigned integer
- **U16**: 16-bit unsigned integer
- **U32**: 32-bit unsigned integer
- **U64**: 64-bit unsigned integer
- **U128**: 128-bit unsigned integer
- **U256**: 256-bit unsigned integer

Example usage:

```typescript
const uint8 = U8.fromN(42);
const uint16 = U16.fromBn(1000n);
console.log(uint8.toBn()); // 42n
console.log(uint16.toBn()); // 1000n
```

## Future Enhancements

- **Signed Integer Support**: Signed integer classes, allowing the
  representation of both positive and negative values, are planned for future
  versions.
- **Floating-Point Support**: IEEE-754 floating-point support will be added to
  extend the range of numbers.

## Contributing

Contributions are welcome! If you’d like to improve the library, feel free to
open an issue or create a pull request on the
[GitHub repository](https://github.com/your-username/webbuf-numbers).

## License

This project is licensed under the MIT License.
