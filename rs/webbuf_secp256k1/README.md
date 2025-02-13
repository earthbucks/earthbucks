# `webbuf_secp256k1` Library

`webbuf_secp256k1` is a Rust library that provides ECDSA functionality for the
secp256k1 elliptic curve used in Bitcoin, Ethereum, and EarthBucks. The library
is designed to work with both Rust and JavaScript/TypeScript, with optional
WebAssembly (WASM) support. It includes key operations, message
signing/verification, Diffie-Hellman, and public/private key validation.

---

## Features

- **ECDSA Operations**: Sign and verify messages using secp256k1.
- **Diffie-Hellman**: Perform elliptic curve Diffie-Hellman key exchange to
  derive shared secrets.
- **Key Handling**: Verify, create, and add private/public keys.
- **WASM Support**: Use the library in JavaScript by enabling the `wasm`
  feature.
- **Blockchain Compatibility**: Works with Bitcoin/Ethereum-style keys and
  signatures.
- **Dual Use**: Compatible with both Rust backends and JavaScript frontends.

---

## Installation

For Rust-only usage:

```toml
[dependencies]
webbuf_secp256k1 = "0.8.0"
```

To enable WASM support:

```toml
[dependencies]
webbuf_secp256k1 = { version = "0.8.0", features = ["wasm"] }
```

---

## Usage

### Rust Example

```rust
use webbuf_secp256k1::{private_key_verify, public_key_create, public_key_verify, ecdsa_sign, ecdsa_verify};

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

### Diffie-Hellman Example (Rust)

```rust
use webbuf_secp256k1::{public_key_create, shared_secret};

// Two private keys
let priv_key_1 = [0x38, 0x49, 0x58, 0x49, 0xf8, 0x38, 0xe8, 0xd5, 0xf8, 0xc9, 0x4d, 0xf2, 0x7a, 0x3c, 0x91, 0x8d,
                  0x8e, 0xe9, 0x6a, 0xbf, 0x6b, 0x74, 0x5f, 0xb5, 0x4d, 0x82, 0x1b, 0xf9, 0x5b, 0x6e, 0x5d, 0xc3];
let priv_key_2 = [0x55, 0x91, 0x22, 0x55, 0x18, 0xa9, 0x19, 0xf0, 0x2a, 0x3f, 0x8c, 0x9a, 0x7a, 0x1b, 0xc1, 0xe2,
                  0x9d, 0x81, 0x3c, 0xd8, 0x5a, 0x39, 0xe7, 0xaa, 0x89, 0x9d, 0xf4, 0x64, 0x5e, 0x4a, 0x6b, 0x91];

// Derive public keys
let pub_key_1 = public_key_create(&priv_key_1).unwrap();
let pub_key_2 = public_key_create(&priv_key_2).unwrap();

// Both parties compute the shared secret using the other's public key
let shared_secret_1 = shared_secret(&priv_key_1, &pub_key_2).unwrap();
let shared_secret_2 = shared_secret(&priv_key_2, &pub_key_1).unwrap();

// Verify that both shared secrets are the same
assert_eq!(shared_secret_1, shared_secret_2);
println!("Shared secret: {:?}", shared_secret_1);
```

---

### JavaScript/TypeScript Example (with WASM)

```javascript
import init, {
  private_key_verify,
  public_key_create,
  public_key_verify,
  ecdsa_sign,
  ecdsa_verify,
} from "./your-wasm-package";

async function example() {
  await init(); // Initialize the WASM module

  const privKey = new Uint8Array(32).fill(1);
  console.log(private_key_verify(privKey)); // true

  const pubKey = public_key_create(privKey);
  console.log("Public Key:", new Uint8Array(pubKey));

  console.log(public_key_verify(pubKey)); // true

  const message = new Uint8Array(32).fill(2);
  const signature = ecdsa_sign(message, privKey);
  console.log("Signature:", new Uint8Array(signature));

  console.log(ecdsa_verify(signature, message, pubKey)); // true
}

example();
```

---

## API

### `shared_secret(priv_key_buf: &[u8], pub_key_buf: &[u8]) -> Result<Vec<u8>, String>`

Derives a shared secret using the Diffie-Hellman key exchange. It takes a
private key (32 bytes) and a public key (33 bytes in compressed SEC1 format),
returning a shared secret.

---

## Tests

To run the tests:

```bash
cargo test
```

Example test for Diffie-Hellman:

```rust
#[test]
fn test_diffie_hellman_shared_secret() {
    let priv_key_1 = [0x38, 0x49, 0x58, 0x49, 0xf8, 0x38, 0xe8, 0xd5, 0xf8, 0xc9, 0x4d, 0xf2, 0x7a, 0x3c, 0x91, 0x8d,
                      0x8e, 0xe9, 0x6a, 0xbf, 0x6b, 0x74, 0x5f, 0xb5, 0x4d, 0x82, 0x1b, 0xf9, 0x5b, 0x6e, 0x5d, 0xc3];
    let priv_key_2 = [0x55, 0x91, 0x22, 0x55, 0x18, 0xa9, 0x19, 0xf0, 0x2a, 0x3f, 0x8c, 0x9a, 0x7a, 0x1b, 0xc1, 0xe2,
                      0x9d, 0x81, 0x3c, 0xd8, 0x5a, 0x39, 0xe7, 0xaa, 0x89, 0x9d, 0xf4, 0x64, 0x5e, 0x4a, 0x6b, 0x91];

    let pub_key_1 = public_key_create(&priv_key_1).unwrap();
    let pub_key_2 = public_key_create(&priv_key_2).unwrap();

    let shared_secret_1 = shared_secret(&priv_key_1, &pub_key_2).unwrap();
    let shared_secret_2 = shared_secret(&priv_key_2, &pub_key_1).unwrap();

    assert_eq!(shared_secret_1, shared_secret_2);
}
```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more
information.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests.
