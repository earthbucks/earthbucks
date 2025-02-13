# WebBuf

WebBuf is a simple Rust library designed to provide efficient base64 and hex encoding/decoding for WebAssembly (WASM) projects, especially targeting JavaScript use cases. It can also be used directly in Rust, where it re-exports functionality from the popular `base64` and `hex` libraries. This library is ideal for developers working with WebAssembly, but its utility extends to general Rust projects as well.

## Features

- **Base64 encoding/decoding**: Convert byte slices to base64 strings and vice versa.
- **Hex encoding/decoding**: Convert byte slices to hex strings and vice versa.
- **Built for WebAssembly**: Optimized to work seamlessly in WebAssembly (WASM) and can be easily integrated into JavaScript projects via WASM bindings.
- **Re-exports from `base64` and `hex` libraries**: Provides a Rust interface for encoding and decoding while making the functions available in WASM for JavaScript.

## Installation

To use WebBuf in your Rust project, add the following to your `Cargo.toml`:

```toml
[dependencies]
base64 = "0.13"
hex = "0.4"
wasm-bindgen = "0.2"
```

To build it for WebAssembly, ensure you have `wasm-pack` installed:

```bash
cargo install wasm-pack
```

Then, build the library with:

```bash
wasm-pack build
```

## Usage

### Rust

You can use WebBuf in any Rust project to encode and decode data into base64 or hex strings. Here's an example of how you can use the functions:

```rust
use webbuf::{encode_base64, decode_base64, encode_hex, decode_hex};

fn main() {
    // Base64 Encoding
    let data = b"Hello, world!";
    let base64_string = encode_base64(data);
    println!("Base64: {}", base64_string);

    // Base64 Decoding
    let decoded_data = decode_base64(&base64_string).unwrap();
    println!("Decoded: {:?}", decoded_data);

    // Hex Encoding
    let hex_string = encode_hex(data);
    println!("Hex: {}", hex_string);

    // Hex Decoding
    let decoded_hex = decode_hex(&hex_string).unwrap();
    println!("Decoded Hex: {:?}", decoded_hex);
}
```

### WebAssembly (JavaScript)

After compiling WebBuf to WebAssembly, you can use the functions in a JavaScript/TypeScript environment as follows:

```typescript
import { encode_base64, decode_base64, encode_hex, decode_hex } from "./webbuf_bg.wasm";

// Base64 Encoding
const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
const base64String = encode_base64(data);
console.log(`Base64: ${base64String}`);

// Base64 Decoding
const decodedData = decode_base64(base64String);
console.log(`Decoded: ${new TextDecoder().decode(new Uint8Array(decodedData))}`);

// Hex Encoding
const hexString = encode_hex(data);
console.log(`Hex: ${hexString}`);

// Hex Decoding
const decodedHex = decode_hex(hexString);
console.log(`Decoded Hex: ${new TextDecoder().decode(new Uint8Array(decodedHex))}`);
```

### Methods

- **`encode_base64(data: &[u8]) -> String`**: Encodes a byte slice into a base64 string.
- **`decode_base64(encoded: &str) -> Result<Vec<u8>, String>`**: Decodes a base64 string into a byte vector. Returns an error string if the decoding fails.
- **`encode_hex(data: &[u8]) -> String`**: Encodes a byte slice into a hex string.
- **`decode_hex(encoded: &str) -> Result<Vec<u8>, String>`**: Decodes a hex string into a byte vector. Returns an error string if the decoding fails.

### Testing

You can run tests on the Rust code using `cargo test`. The tests cover both valid and invalid cases for base64 and hex encoding/decoding.

```bash
cargo test
```

The tests included in the `tests` module verify that the library performs encoding and decoding correctly. Example tests:

- Base64 encoding of `"Hello, world!"` should return `"SGVsbG8sIHdvcmxkIQ=="`.
- Base64 decoding of `"SGVsbG8sIHdvcmxkIQ=="` should return `"Hello, world!"`.
- Hex encoding of `"Hello, world!"` should return `"48656c6c6f2c20776f726c6421"`.
- Hex decoding of `"48656c6c6f2c20776f726c6421"` should return `"Hello, world!"`.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve WebBuf.

## License

This project is licensed under the MIT License.
