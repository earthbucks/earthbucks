# @earthbucks/blake3

**@earthbucks/blake3** is a lightweight, **inline synchronous WebAssembly
(WASM) implementation of the BLAKE3 hashing algorithm**. This library allows
for high-performance hashing directly in JavaScript, using WASM for speed, and
works seamlessly in **both browsers and Node.js**. 

This package is optimized for inline Base64 WASM to ensure **synchronous
loading** without requiring separate binary files. This means you can use it in
your code without worrying about async loading or managing external files.
However, it does mean the files are slightly larger than if they were separate.

## Features

- **BLAKE3 hashing**: Fast, cryptographic hash function.
- **Inline WASM as Base64**: No need to manage external binary files.
- **Synchronous WASM loading**: Runs efficiently without async loading.
- **Works across Node.js and browsers**: Same interface for both environments.

---

## Installation

Install the package using your favorite package manager:

```bash
# Using npm
npm install @earthbucks/blake3

# Using yarn
yarn add @earthbucks/blake3

# Using pnpm
pnpm add @earthbucks/blake3
```

---

## Usage

This package exposes three main functions: `blake3_hash`, `double_blake3_hash`,
and `blake3_mac`. Each function takes `Uint8Array` inputs and returns a
`Uint8Array` result.

### 1. **Hashing Data with `blake3_hash`**

```javascript
import { blake3_hash } from '@earthbucks/blake3';

const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
const hash = blake3_hash(data);

console.log(hash); // Uint8Array output
```

### 2. **Double Hash with `double_blake3_hash`**

```javascript
import { double_blake3_hash } from '@earthbucks/blake3';

const data = new Uint8Array([104, 101, 108, 108, 111]);
const doubleHash = double_blake3_hash(data);

console.log(doubleHash); // Uint8Array output
```

### 3. **Message Authentication Code (MAC) with `blake3_mac`**

```javascript
import { blake3_mac } from '@earthbucks/blake3';

const key = new Uint8Array(32); // Replace with your 32-byte key
const data = new Uint8Array([104, 101, 108, 108, 111]);
const mac = blake3_mac(key, data);

console.log(mac); // Uint8Array output
```

---

## API Reference

```typescript
/**
 * Hashes the input data using BLAKE3.
 * @param {Uint8Array} data - Input data to hash.
 * @returns {Uint8Array} - BLAKE3 hash of the input data.
 */
export function blake3_hash(data: Uint8Array): Uint8Array;

/**
 * Applies BLAKE3 hash twice to the input data.
 * @param {Uint8Array} data - Input data to double-hash.
 * @returns {Uint8Array} - Result of applying BLAKE3 twice.
 */
export function double_blake3_hash(data: Uint8Array): Uint8Array;

/**
 * Creates a BLAKE3-based MAC (Message Authentication Code).
 * @param {Uint8Array} key - 32-byte key for the MAC.
 * @param {Uint8Array} data - Input data to authenticate.
 * @returns {Uint8Array} - Authentication tag for the input data.
 */
export function blake3_mac(key: Uint8Array, data: Uint8Array): Uint8Array;
```

---

## TypeScript Support

This library comes with built-in **TypeScript definitions**, so you get full
type support out of the box. Example:

```typescript
import { blake3_hash } from '@earthbucks/blake3';

const data: Uint8Array = new Uint8Array([1, 2, 3, 4]);
const hash: Uint8Array = blake3_hash(data);
```

---

## Compatibility

This library supports **Node.js** (v14+) and modern browsers that support
WebAssembly (WASM). Since it loads the WASM module inline as Base64, there is
**no need to manage external `.wasm` files**.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Contributing

We welcome contributions! Please open an issue or submit a pull request on
GitHub if you have any improvements or bug fixes.
```
