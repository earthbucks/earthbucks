import { describe, it, expect } from "vitest";
import { Buffer as NpmBuffer } from "buffer/index.js";
import { WebBuf } from "../src/webbuf.js";

const SIZE = 10_000_000;

describe("WebBuf Benchmarks", () => {
  describe.skip("threshold speed tests", () => {
    it.skip("to hex: should get the same speed for both values", () => {
      for (let i = 0; i < 10; i++) {
        const TO_HEX_ALGO_THRESHOLD = WebBuf.TO_HEX_ALGO_THRESHOLD;
        const smallBufLength = TO_HEX_ALGO_THRESHOLD - 1;
        const largeBufLength = TO_HEX_ALGO_THRESHOLD + 1;
        const smallBuf = WebBuf.alloc(smallBufLength);
        const largeBuf = WebBuf.alloc(largeBufLength);
        for (let i = 0; i < smallBufLength; i++) {
          const val = i % 256;
          smallBuf[i] = val;
        }
        for (let i = 0; i < largeBufLength; i++) {
          const val = i % 255;
          largeBuf[i] = val;
        }
        const startSmall = performance.now();
        const smallHex = smallBuf.toHex();
        const endSmall = performance.now();
        const startLarge = performance.now();
        const largeHex = largeBuf.toHex();
        const endLarge = performance.now();
        console.log(`Small: ${endSmall - startSmall} ms`);
        console.log(`Large: ${endLarge - startLarge} ms`);
        const fromSmallHex = WebBuf.fromHex(smallHex);
        const fromLargeHex = WebBuf.fromHex(largeHex);
        expect(fromSmallHex.toHex()).toBe(smallHex);
        expect(fromLargeHex.toHex()).toBe(largeHex);
      }
    });

    it("to base64: should get the same speed for both values", () => {
      for (let i = 0; i < 10; i++) {
        const TO_BASE64_ALGO_THRESHOLD = WebBuf.TO_BASE64_ALGO_THRESHOLD;
        const smallBufLength = TO_BASE64_ALGO_THRESHOLD - 1;
        const largeBufLength = TO_BASE64_ALGO_THRESHOLD + 1;
        const smallBuf = WebBuf.alloc(smallBufLength);
        const largeBuf = WebBuf.alloc(largeBufLength);
        for (let i = 0; i < smallBufLength; i++) {
          const val = i % 256;
          smallBuf[i] = val;
        }
        for (let i = 0; i < largeBufLength; i++) {
          const val = i % 255;
          largeBuf[i] = val;
        }
        const startSmall = performance.now();
        const smallBase64 = smallBuf.toBase64();
        const endSmall = performance.now();
        const startLarge = performance.now();
        const largeBase64 = largeBuf.toBase64();
        const endLarge = performance.now();
        console.log(`Small: ${endSmall - startSmall} ms`);
        console.log(`Large: ${endLarge - startLarge} ms`);
        const fromSmallBase64 = WebBuf.fromBase64(smallBase64);
        const fromLargeBase64 = WebBuf.fromBase64(largeBase64);
        expect(fromSmallBase64.toBase64()).toBe(smallBase64);
        expect(fromLargeBase64.toBase64()).toBe(largeBase64);
      }
    });

    it("from hex: should get the same speed for both values", () => {
      for (let i = 0; i < 10; i++) {
        const FROM_HEX_ALGO_THRESHOLD = WebBuf.FROM_HEX_ALGO_THRESHOLD;
        const smallBufLength = FROM_HEX_ALGO_THRESHOLD / 2 - 1;
        const largeBufLength = FROM_HEX_ALGO_THRESHOLD / 2 + 1;
        const smallBuf = WebBuf.alloc(smallBufLength);
        const largeBuf = WebBuf.alloc(largeBufLength);
        for (let i = 0; i < smallBufLength; i++) {
          const val = i % 256;
          smallBuf[i] = val;
        }
        for (let i = 0; i < largeBufLength; i++) {
          const val = i % 255;
          largeBuf[i] = val;
        }
        const smallHex = smallBuf.toHex();
        const largeHex = largeBuf.toHex();
        const startSmall = performance.now();
        const fromSmallHex = WebBuf.fromHex(smallHex);
        const endSmall = performance.now();
        const startLarge = performance.now();
        const fromLargeHex = WebBuf.fromHex(largeHex);
        const endLarge = performance.now();
        console.log(`Small: ${endSmall - startSmall} ms`);
        console.log(`Large: ${endLarge - startLarge} ms`);
        expect(fromSmallHex.toHex()).toBe(smallHex);
        expect(fromLargeHex.toHex()).toBe(largeHex);
      }
    });

    it("from base64: should get the same speed for both values", () => {
      for (let i = 0; i < 10; i++) {
        const FROM_BASE64_ALGO_THRESHOLD = WebBuf.FROM_BASE64_ALGO_THRESHOLD;
        // make two buffers:
        // the small one must have a base64 length of FROM_BASE64_ALGO_THRESHOLD - 1
        // the large one must have a base64 length of FROM_BASE64_ALGO_THRESHOLD + 1
        let smallBuf: WebBuf;
        let largeBuf: WebBuf;
        let smallBase64: string;
        let largeBase64: string;
        let smallLength = Math.round(FROM_BASE64_ALGO_THRESHOLD / 2);
        let largeLength = Math.round(FROM_BASE64_ALGO_THRESHOLD / 2);
        do {
          smallLength++;
          smallBuf = WebBuf.alloc(smallLength);
          for (let i = 0; i < smallLength; i++) {
            const val = i % 256;
            smallBuf[i] = val;
          }
          smallBase64 = smallBuf.toBase64();
        } while (smallBase64.length + 3 < FROM_BASE64_ALGO_THRESHOLD - 1);
        do {
          largeLength++;
          largeBuf = WebBuf.alloc(largeLength);
          for (let i = 0; i < largeLength; i++) {
            const val = i % 256;
            largeBuf[i] = val;
          }
          largeBase64 = largeBuf.toBase64();
        } while (largeBase64.length - 3 < FROM_BASE64_ALGO_THRESHOLD + 1);
        const startSmall = performance.now();
        const fromSmallBase64 = WebBuf.fromBase64(smallBase64);
        const endSmall = performance.now();
        const startLarge = performance.now();
        const fromLargeBase64 = WebBuf.fromBase64(largeBase64);
        const endLarge = performance.now();
        console.log(`Small: ${endSmall - startSmall} ms`);
        console.log(`Large: ${endLarge - startLarge} ms`);
        expect(fromSmallBase64.toBase64()).toBe(smallBase64);
        expect(fromLargeBase64.toBase64()).toBe(largeBase64);
      }
    });
  });

  describe("speed of to/from hex", () => {
    it("should encode this large buffer to base64", () => {
      const testArray = new Uint8Array(SIZE); // Large Uint8Array for benchmarking
      // fill with iterating count
      for (let i = 0; i < testArray.length; i++) {
        testArray[i] = i % 256;
      }
      const npmBuffer = NpmBuffer.from(testArray.buffer);
      const wasmBuffer = WebBuf.from(testArray);

      // Npm Buffer
      const startNpm = performance.now();
      const base64Npm = npmBuffer.toString("base64");
      const endNpm = performance.now();
      console.log(`Npm method time: ${endNpm - startNpm} ms`);

      // wasm methods
      const startWasm = performance.now();
      const base64Wasm = wasmBuffer.toString("base64");
      const endWasm = performance.now();
      console.log(`Wasm method time: ${endWasm - startWasm} ms`);

      expect(base64Npm).toBe(base64Wasm);
    });

    it("should decode this large base64 string", () => {
      const testArray = new Uint8Array(SIZE); // Large Uint8Array for benchmarking
      // fill with iterating count
      for (let i = 0; i < testArray.length; i++) {
        testArray[i] = i % 256;
      }
      const npmBuffer = NpmBuffer.from(testArray.buffer);
      const base64 = npmBuffer.toString("base64");

      // Npm Buffer
      const startNpm = performance.now();
      const decodedNpm = NpmBuffer.from(base64, "base64");
      const endNpm = performance.now();
      console.log(`Npm method time: ${endNpm - startNpm} ms`);

      // wasm methods
      const startWasm = performance.now();
      const decodedWasm = WebBuf.from(base64, "base64");
      const endWasm = performance.now();
      console.log(`Wasm method time: ${endWasm - startWasm} ms`);

      // Make sure they are all equal
      expect(NpmBuffer.from(decodedWasm).toString("hex")).toBe(
        decodedNpm.toString("hex"),
      );
    });

    it("should encode this large buffer to hex", () => {
      const testArray = new Uint8Array(SIZE); // Large Uint8Array for benchmarking
      // fill with iterating count
      for (let i = 0; i < testArray.length; i++) {
        testArray[i] = i % 256;
      }
      const npmBuffer = NpmBuffer.from(testArray.buffer);
      const wasmBuffer = WebBuf.from(testArray);

      // Npm Buffer
      const startNpm = performance.now();
      const hexNpm = npmBuffer.toString("hex");
      const endNpm = performance.now();
      console.log(`Npm method time: ${endNpm - startNpm} ms`);

      // wasm methods
      const startWasm = performance.now();
      const hexWasm = wasmBuffer.toString("hex");
      const endWasm = performance.now();
      console.log(`Wasm method time: ${endWasm - startWasm} ms`);

      // Make sure they are all equal
      expect(hexNpm).toBe(hexWasm);
    });

    it("should decode this large hex string", () => {
      const testArray = new Uint8Array(SIZE); // Large Uint8Array for benchmarking
      // fill with iterating count
      for (let i = 0; i < testArray.length; i++) {
        testArray[i] = i % 256;
      }
      //const npmBuffer = NpmBuffer.from(testArray.buffer);
      const hex = NpmBuffer.from(testArray).toString("hex");

      // Npm Buffer
      const startNpm = performance.now();
      const decodedNpm = NpmBuffer.from(hex, "hex");
      const endNpm = performance.now();
      console.log(`Npm method time: ${endNpm - startNpm} ms`);

      // wasm methods
      const startWasm = performance.now();
      const decodedWasm = WebBuf.from(hex, "hex");
      const endWasm = performance.now();
      console.log(`Wasm method time: ${endWasm - startWasm} ms`);

      // Make sure they are all equal
      expect(NpmBuffer.from(decodedWasm).toString("hex")).toBe(
        decodedNpm.toString("hex"),
      );
    });
  });
});
