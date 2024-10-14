# `earthbucks_secp256k1` Library

`earthbucks_secp256k1` is a Rust library that provides ECDSA functionality for the secp256k1 elliptic curve used in Bitcoin, Ethereum, and EarthBucks. The library is designed to work with both Rust and JavaScript/TypeScript, with optional WebAssembly (WASM) support. It includes key operations, message signing/verification, and public/private key validation.

---

## Features

- **ECDSA Operations**: Sign and verify messages using secp256k1.
- **Key Handling**: Verify, create, and add private/public keys.
- **WASM Support**: Use the library in JavaScript by enabling the `wasm` feature.
- **Blockchain Compatibility**: Works with Bitcoin/Ethereum-style keys and signatures.
- **Dual Use**: Compatible with both Rust backends and JavaScript frontends.

---

## Installation

For Rust-only usage:

```toml
[dependencies]
earthbucks_secp256k1 = "0.1.0"
```

To enable WASM support:

```toml
[dependencies]
earthbucks_secp256k1 = { version = "0.1.0", features = ["wasm"] }
```

---

## Usage

### Rust Example

```rust
use earthbucks_secp256k1::{private_key_verify, public_key_create, public_key_verify, ecdsa_sign, ecdsa_verify};

// Verify a private key
let valid_key = [0x01; 32];
assert!(private_key_verify(&valid_key));

// Create a public key from a private key
let public_key = public_key_create(&valid_key).unwrap();
println!("Public key: {:?}", public_key);

// Verify the public key
assert!(public_key_verify(&public_key));

// Sign a message
let message = [0x02; 32];
let signature = ecdsa_sign(&message, &valid_key).unwrap();
println!("Signature: {:?}", signature);

// Verify the signature
assert!(ecdsa_verify(&signature, &message, &public_key).unwrap());
```

### JavaScript/TypeScript Example (with WASM)

```javascript
import init, { private_key_verify, public_key_create, public_key_verify, ecdsa_sign, ecdsa_verify } from './your-wasm-package';

async function example() {
    await init(); // Initialize the WASM module

    const privKey = new Uint8Array(32).fill(1);
    console.log(private_key_verify(privKey)); // true

    const pubKey = public_key_create(privKey);
    console.log('Public Key:', new Uint8Array(pubKey));

    console.log(public_key_verify(pubKey)); // true

    const message = new Uint8Array(32).fill(2);
    const signature = ecdsa_sign(message, privKey);
    console.log('Signature:', new Uint8Array(signature));

    console.log(ecdsa_verify(signature, message, pubKey)); // true
}

example();
```

---

## Building with WASM

To build the library with WASM:

```bash
wasm-pack build -- --features wasm
```

For native Rust builds:

```bash
cargo build
```

---

## API

### `private_key_verify(priv_key_buf: &[u8]) -> bool`
Verifies if the provided private key is valid.

### `public_key_create(priv_key_buf: &[u8]) -> Result<Vec<u8>, String>`
Generates a public key from a 32-byte private key.

### `public_key_verify(pub_key_buf: &[u8]) -> bool`
Verifies if the provided public key is valid (33-byte compressed SEC1 format).

### `private_key_add(priv_key_buf_1: &[u8], priv_key_buf_2: &[u8]) -> Result<Vec<u8>, String>`
Performs scalar addition on two private keys.

### `public_key_add(pub_key_buf_1: &[u8], pub_key_buf_2: &[u8]) -> Result<Vec<u8>, String>`
Adds two public keys (both in compressed SEC1 format).

### `ecdsa_sign(digest: &[u8], priv_key_buf: &[u8]) -> Result<Vec<u8>, String>`
Signs a 32-byte digest with a private key, returning the signature.

### `ecdsa_verify(sig_buf: &[u8], digest: &[u8], pub_key_buf: &[u8]) -> Result<bool, String>`
Verifies the provided signature using the digest and public key.

---

## Tests

To run the tests:

```bash
cargo test
```

Example test:

```rust
#[test]
fn test_public_key_verify() {
    let priv_key = [0x01; 32];
    let pub_key = public_key_create(&priv_key).unwrap();

    assert!(public_key_verify(&pub_key));
}
```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests.
