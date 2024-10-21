# @earthbucks/secp256k1

`@earthbucks/secp256k1` is a TypeScript/Node.js library with WebAssembly (WASM) support, providing ECDSA and Diffie-Hellman functionality for the secp256k1 elliptic curve, commonly used in Bitcoin, Ethereum, and EarthBucks. The library allows you to perform key operations, message signing/verification, and Diffie-Hellman key exchanges using a pre-built WebAssembly module.

---

## Features

- **ECDSA Operations**: Sign and verify messages using the secp256k1 elliptic curve.
- **Diffie-Hellman Key Exchange**: Compute shared secrets with elliptic curve Diffie-Hellman.
- **Key Handling**: Verify, create, and add private and public keys.
- **WASM Support**: High performance via WebAssembly, easily usable in Node.js and the browser.
- **Blockchain Compatibility**: Works with Bitcoin, Ethereum, and EarthBucks-style keys and signatures.

---

## Installation

To install the package in your Node.js or TypeScript project:

```bash
npm install earthbucks-secp256k1
```

---

## Usage

### TypeScript/Node.js Example

```typescript
import { private_key_verify, public_key_create, public_key_verify, shared_secret, ecdsa_sign, ecdsa_verify } from 'earthbucks-secp256k1';

// Private key as Uint8Array
const privKey = new Uint8Array(32).fill(1); // Example private key
const message = new Uint8Array(32).fill(2); // Example message (digest)

// Verify the private key
console.log(private_key_verify(privKey)); // true

// Create a public key from the private key
const pubKey = public_key_create(privKey);
console.log('Public Key:', new Uint8Array(pubKey));

// Verify the public key
console.log(public_key_verify(pubKey)); // true

// Sign a message with the private key
const signature = ecdsa_sign(message, privKey);
console.log('Signature:', new Uint8Array(signature));

// Verify the signature with the public key and message
console.log(ecdsa_verify(signature, message, pubKey)); // true

// Perform Diffie-Hellman key exchange with another public key
const otherPubKey = public_key_create(new Uint8Array(32).fill(2)); // Another example public key
const sharedSecret = shared_secret(privKey, otherPubKey);
console.log('Shared Secret:', new Uint8Array(sharedSecret));
```

### API Documentation

- **`private_key_verify(priv_key_buf: Uint8Array): boolean`**  
  Verifies whether a 32-byte private key is valid.

- **`public_key_verify(pub_key_buf: Uint8Array): boolean`**  
  Verifies a 33-byte compressed public key in SEC1 format.

- **`public_key_create(priv_key_buf: Uint8Array): Uint8Array`**  
  Generates a public key from a 32-byte private key and returns it in compressed SEC1 format.

- **`private_key_add(priv_key_buf_1: Uint8Array, priv_key_buf_2: Uint8Array): Uint8Array`**  
  Adds two private keys together and returns the resulting private key.

- **`public_key_add(pub_key_buf_1: Uint8Array, pub_key_buf_2: Uint8Array): Uint8Array`**  
  Adds two public keys together (both in compressed SEC1 format) and returns the result.

- **`ecdsa_sign(digest: Uint8Array, priv_key_buf: Uint8Array): Uint8Array`**  
  Signs a 32-byte message digest with a private key and returns the 64-byte signature.

- **`ecdsa_verify(sig_buf: Uint8Array, digest: Uint8Array, pub_key_buf: Uint8Array): boolean`**  
  Verifies the provided signature, digest, and public key.

- **`shared_secret(priv_key_buf: Uint8Array, pub_key_buf: Uint8Array): Uint8Array`**  
  Performs elliptic curve Diffie-Hellman (ECDH) to compute a shared secret between a private key and a public key.

---

## Running Tests

To ensure the library works as expected, run the tests:

```bash
npm test
```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

This updated `README` includes instructions for using the WASM functions re-exported in TypeScript, along with the updated API and usage examples for Node.js projects. Let me know if you need further adjustments!
