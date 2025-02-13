# webbuf_aescbc

`webbuf_aescbc` provides low-level AES encryption in Cipher Block Chaining (CBC) mode, designed specifically to support WebAssembly (Wasm) builds. This crate is intended for environments like browsers, Node.js, Deno, and Bun. It provides two primary modules: `aes` for single-block encryption and decryption, and `aescbc` for chaining multiple blocks together using CBC mode.

> **Warning**: `webbuf_aescbc` does not provide any form of message authentication. To ensure secure and authentic data transmission, combine it with a hashing function, such as HMAC.

---

## Installation

Add the following to your `Cargo.toml` to use `webbuf_aescbc` in your project:

```toml
[dependencies]
webbuf_aescbc = "0.1.0"
```

If you plan to use this crate with Wasm, enable the `wasm` feature:

```toml
[dependencies]
webbuf_aescbc = { version = "0.1.0", features = ["wasm"] }
```

## Overview

This crate exposes low-level AES and AES-CBC encryption and decryption functions. It is designed for users who need control over encryption at the block level, especially within WebAssembly contexts. The `aes` module provides single-block encryption and decryption, while the `aescbc` module extends this to work over multiple blocks in CBC mode.

---

## Modules

### 1. aes

The `aes` module provides functions for **single-block AES encryption and decryption**. Supported key sizes include 128-bit, 192-bit, and 256-bit. This module is low-level; each function expects exactly one 16-byte block of data and does not perform any padding or chaining. 

**Functions:**

- **`aes_encrypt`**: Encrypts a 16-byte block using a 128, 192, or 256-bit key.
- **`aes_decrypt`**: Decrypts a 16-byte block using a 128, 192, or 256-bit key.

**Usage Example**:
```rust
use webbuf_aescbc::aes::{aes_encrypt, aes_decrypt};

// 128-bit key
let key = [0x00; 16]; 
let data = [0x01; 16]; // Single 16-byte block

let encrypted_data = aes_encrypt(&key, &data).expect("Encryption failed");
let decrypted_data = aes_decrypt(&key, &encrypted_data).expect("Decryption failed");

assert_eq!(data.to_vec(), decrypted_data);
```

**Note**: If you are unfamiliar with AES encryption at the block level, it may be easier to use a higher-level library that handles CBC, padding, and authentication for you.

---

### 2. aescbc

The `aescbc` module builds on the `aes` module to provide **AES encryption in CBC mode**, enabling encryption of data longer than a single block. It uses PKCS#7 padding to ensure that plaintexts of any size can be encrypted. 

**Functions:**

- **`aescbc_encrypt`**: Encrypts data of any length using AES in CBC mode, with the specified key and IV.
- **`aescbc_decrypt`**: Decrypts ciphertext of any length using AES in CBC mode, with the specified key and IV, and removes padding.

**Usage Example**:
```rust
use webbuf_aescbc::aescbc::{aescbc_encrypt, aescbc_decrypt};

// 128-bit key and IV
let key = [0x00; 16];
let iv = [0x00; 16];
let plaintext = b"Encrypt this data in AES-CBC mode";

// Encrypt
let ciphertext = aescbc_encrypt(plaintext, &key, &iv).expect("Encryption failed");

// Decrypt
let decrypted_data = aescbc_decrypt(&ciphertext, &key, &iv).expect("Decryption failed");
assert_eq!(plaintext.to_vec(), decrypted_data);
```

---

## Important Notes

1. **No Authentication**: `webbuf_aescbc` does not include authentication. To ensure that the data is not tampered with, use an additional hash function (e.g., HMAC) for authentication.
   
2. **Low-Level Library**: This crate is designed for users who are familiar with AES encryption details. It does not manage keys, padding, or IV generation for you, except for PKCS#7 padding in `aescbc`.

3. **Error Handling**: The functions in both `aes` and `aescbc` modules return `Result` types, which allow you to handle errors related to invalid key sizes, data length mismatches, or invalid IV lengths.

---

## Building for Wasm

To build `webbuf_aescbc` for WebAssembly, enable the `wasm` feature:

```sh
cargo build --release --target wasm32-unknown-unknown --features wasm
```

After building, you can use the generated `.wasm` file with JavaScript in a browser or any JavaScript runtime that supports Wasm (Node.js, Deno, Bun).

---

## License

This crate is licensed under the MIT License. See [LICENSE](LICENSE) for more details.
