# @webbuf/blake3

**@webbuf/blake3** is a lightweight, **inline synchronous WebAssembly
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
npm install @webbuf/blake3

# Using yarn
yarn add @webbuf/blake3

# Using pnpm
pnpm add @webbuf/blake3
```

---

## Usage

This package exposes three main functions: `blake3Hash`, `doubleBlake3Hash`,
and `blake3Mac`. Each function takes `WebBuf` inputs and returns a
`WebBuf` result.

### 1. **Hashing Data with `blake3Hash`**

```javascript
import { blake3Hash } from '@webbuf/blake3';

const data = new WebBuf([104, 101, 108, 108, 111]); // "hello"
const hash = blake3Hash(data);

console.log(hash.buf.toHex()); // hex output
```

### 2. **Double Hash with `doubleBlake3Hash`**

```javascript
import { doubleBlake3Hash } from '@webbuf/blake3';

const data = new WebBuf([104, 101, 108, 108, 111]);
const doubleHash = doubleBlake3Hash(data);

console.log(doubleHash.buf.toHex()); // hex output
```

### 3. **Message Authentication Code (MAC) with `blake3Mac`**

```javascript
import { WebBuf } from "webbuf";
import { blake3Hash } from '@webbuf/blake3';
import { FixedBuf } from "@webbuf/fixedbuf";

const key = FixedBuf.fromHex(32, '...'); // Replace with your 32-byte key
const data = WebBuf.fromHex('...'); // Replace with your input data
const mac = blake3Mac(key, data);

console.log(mac.buf.toHex()); // hex output
```

---

## API Reference

```typescript
/**
 * Hashes the input data using BLAKE3.
 * @param {WebBuf} data - Input data to hash.
 * @returns {FixedBuf<32>} - BLAKE3 hash of the input data.
 */
export function blake3Hash(data: WebBuf): FixedBuf<32>;

/**
 * Applies BLAKE3 hash twice to the input data.
 * @param {WebBuf} data - Input data to double-hash.
 * @returns {FixedBuf<32>} - Result of applying BLAKE3 twice.
 */
export function doubleBlake3Hash(data: WebBuf): FixedBuf<32>;

/**
 * Creates a BLAKE3-based MAC (Message Authentication Code).
 * @param {FixedBuf<32>} key - 32-byte key for the MAC.
 * @param {WebBuf} data - Input data to authenticate.
 * @returns {FixedBuf<32>} - Authentication tag for the input data.
 */
export function blake3Mac(key: FixedBuf<32>, data: WebBuf): FixedBuf<32>;
```

---

## TypeScript Support

This library comes with built-in **TypeScript definitions**, so you get full
type support out of the box. Example:

```typescript
import { WebBuf } from "webbuf";
import { blake3Hash } from '@webbuf/blake3';
import { FixedBuf } from "@webbuf/fixedbuf";

const data: WebBuf = new WebBuf([1, 2, 3, 4]);
const hash: FixedBuf<32> = blake3Hash(data);
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
