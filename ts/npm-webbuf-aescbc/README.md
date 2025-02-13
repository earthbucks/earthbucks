# @webbuf/aescbc

`@webbuf/aescbc` is a TypeScript package that provides **AES encryption in CBC
mode** with a Rust-backed WebAssembly (Wasm) implementation for high performance
in browsers and JavaScript environments like Node.js, Deno, and Bun. This
package offers low-level cryptographic functions using the WebAssembly import,
making it suitable for applications requiring fast AES-CBC encryption and
decryption.

> **Note**: This package does not provide message authentication. To ensure data
> authenticity, pair it with a hash function, such as HMAC.

---

## Installation

To install, run:

```bash
npm install @webbuf/aescbc
```

Make sure your project supports WebAssembly imports via inline base64.

---

## Overview

`@webbuf/aescbc` provides two main functions for AES encryption in CBC mode:
`aescbcEncrypt` and `aescbcDecrypt`. The package requires Wasm bindings from the
Rust `webbuf_aescbc` library, which provides the AES operations. This package is
designed for developers comfortable with cryptographic functions and low-level
control.

---

## Functions

### 1. `aescbcEncrypt`

Encrypts plaintext using AES-CBC with the provided AES key and initialization
vector (IV). If no IV is supplied, a random 16-byte IV is generated
automatically.

#### Parameters:

- **`plaintext`**: The data to encrypt (instance of `WebBuf`).
- **`aesKey`**: The AES key (16, 24, or 32 bytes) as `FixedBuf<16>`,
  `FixedBuf<24>`, or `FixedBuf<32>`.
- **`iv`**: (Optional) The initialization vector (`FixedBuf<16>`).

#### Returns:

- Encrypted data (`WebBuf`) with the IV prepended to the ciphertext.

#### Usage Example:

```typescript
import { aescbcEncrypt } from "@webbuf/aescbc";
import { WebBuf, FixedBuf } from "webbuf";

// Define 16-byte AES key and plaintext
const aesKey = FixedBuf.fromUint8Array(new Uint8Array(16));
const plaintext = WebBuf.fromString("Encrypt this with AES-CBC");

// Encrypt
const ciphertext = aescbcEncrypt(plaintext, aesKey);
console.log("Ciphertext:", ciphertext);
```

### 2. `aescbcDecrypt`

Decrypts AES-CBC ciphertext with the specified AES key.

#### Parameters:

- **`ciphertext`**: The data to decrypt (`WebBuf`).
- **`aesKey`**: The AES key (16, 24, or 32 bytes) as `FixedBuf<16>`,
  `FixedBuf<24>`, or `FixedBuf<32>`.

#### Returns:

- Decrypted data (`WebBuf`) containing the original plaintext.

#### Usage Example:

```typescript
import { aescbcDecrypt } from "@webbuf/aescbc";
import { WebBuf, FixedBuf } from "webbuf";

// Decrypt using the same AES key
const decryptedText = aescbcDecrypt(ciphertext, aesKey);
console.log("Decrypted:", decryptedText.toString());
```

---

## Important Notes

- **IV Management**: If no IV is provided during encryption, a random IV is
  generated. The IV is concatenated to the ciphertext by default. Ensure you
  manage the IV correctly during decryption.

- **Low-Level Library**: This package provides low-level cryptographic
  functions. If you are not familiar with block cipher encryption or AES, you
  may want to use a higher-level library that handles CBC mode and data
  integrity checks.

- **Message Authentication**: This library does not include authentication, so
  ensure you verify data authenticity with a hash function (e.g., HMAC) if you
  use this in a security-sensitive context.

## License

This package is licensed under the MIT License. See [LICENSE](LICENSE) for more
information.
