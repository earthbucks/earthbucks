# `earthbucks_blake3` Library

`earthbucks_blake3` is a Rust library that provides an easy-to-use interface
for computing BLAKE3 hashes, double hashes, and Message Authentication Codes
  (MAC) using the BLAKE3 algorithm. This library is designed to work with both
  Rust and JavaScript/TypeScript by enabling WASM support with an optional
  feature.

## Features

- **BLAKE3 Hashing**: Compute hashes with the BLAKE3 algorithm for data integrity and verification.
- **Double Hashing**: Hash a message twice to provide enhanced security (e.g., for blockchain applications).
- **MAC Generation**: Create a keyed MAC using BLAKE3 to verify data integrity and authenticity.
- **WASM Support**: Build the library for WebAssembly with the `wasm` feature, enabling usage in JavaScript environments.

---

## Installation

Add the following dependency to your `Cargo.toml`:

```toml
[dependencies]
earthbucks_blake3 = { version = "0.1.0", features = ["wasm"] } # Enable WASM if needed
```

To build the library for **Rust-only** usage, skip the `wasm` feature:

```toml
[dependencies]
earthbucks_blake3 = "0.1.0"
```

---

## Usage

### Rust Example

```rust
use earthbucks_blake3::{blake3_hash, double_blake3_hash, blake3_mac};

// Compute a BLAKE3 hash
let data = b"hello world";
let hash = blake3_hash(data).unwrap();
println!("BLAKE3 hash: {:?}", hash);

// Compute a double BLAKE3 hash
let double_hash = double_blake3_hash(data).unwrap();
println!("Double BLAKE3 hash: {:?}", double_hash);

// Generate a keyed MAC
let key = [0x00; 32]; // 32-byte key
let mac = blake3_mac(&key, data).unwrap();
println!("BLAKE3 MAC: {:?}", mac);
```

### JavaScript/TypeScript Example (with WASM)

When building with `wasm-pack`, the functions are exposed to JavaScript. Example:

```javascript
import init, { blake3_hash, double_blake3_hash, blake3_mac } from './your-wasm-package';

async function example() {
    await init(); // Initialize the WASM module

    const data = new TextEncoder().encode('hello world');
    const hash = blake3_hash(data);
    console.log('BLAKE3 hash:', new Uint8Array(hash));

    const doubleHash = double_blake3_hash(data);
    console.log('Double BLAKE3 hash:', new Uint8Array(doubleHash));

    const key = new Uint8Array(32); // 32-byte key
    const mac = blake3_mac(key, data);
    console.log('BLAKE3 MAC:', new Uint8Array(mac));
}

example();
```

---

## Building with WASM

To build the library for WebAssembly, use:

```bash
wasm-pack build -- --features wasm
```

To build the library for native Rust usage (without WASM):

```bash
cargo build
```

---

## API

### `blake3_hash(data: &[u8]) -> Result<Vec<u8>, String>`
Computes a BLAKE3 hash for the given data.

### `double_blake3_hash(data: &[u8]) -> Result<Vec<u8>, String>`
Computes a double BLAKE3 hash by hashing the input twice.

### `blake3_mac(key: &[u8], data: &[u8]) -> Result<Vec<u8>, String>`
Generates a keyed MAC using the BLAKE3 algorithm. The key must be exactly 32 bytes.

---

## Tests

The library includes unit tests to ensure correctness. Run tests with:

```bash
cargo test
```

Example Test Case:

```rust
#[test]
fn test_blake3_mac() {
    let key = blake3_hash(b"key").unwrap();
    let mac = blake3_mac(&key, b"data").unwrap();
    let expected_mac = hex::decode("438f903a8fc5997489497c30477dc32c5ece10f44049e302b85a83603960ec27").unwrap();
    assert_eq!(mac, expected_mac);
}
```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contributing

Feel free to open issues and submit pull requests. Contributions are welcome!

