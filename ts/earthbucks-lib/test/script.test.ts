import { describe, expect, test, beforeEach, it } from "vitest";
import { Script } from "../src/script.js";
import { SysBuf } from "../src/ebx-buf.js";
import fs from "fs";
import path from "path";
import {
  GenericError,
  NonMinimalEncodingError,
  NotEnoughDataError,
} from "../src/ebx-error.js";

describe("Script", () => {
  test("constructor", () => {
    const script = new Script();
    expect(script.chunks).toEqual([]);
  });

  test("fromIsoStr", () => {
    const script = Script.fromIsoStr("DUP DOUBLEBLAKE3");
    expect(script.chunks.length).toBe(2);
    expect(script.chunks[0].toIsoStr()).toBe("DUP");
    expect(script.chunks[1].toIsoStr()).toBe("DOUBLEBLAKE3");
  });

  test("fromIsoStr toString with PUSHDATA1", () => {
    const script = Script.fromIsoStr("0x00");
    expect(script.toIsoStr()).toBe("0x00");
  });

  test("fromIsoStr toString with PUSHDATA2", () => {
    const script = Script.fromIsoStr("0x" + "00".repeat(256));
    expect(script.toIsoStr()).toBe("0x" + "00".repeat(256));
  });

  test("toString", () => {
    const script = Script.fromIsoStr("DUP DOUBLEBLAKE3");
    expect(script.toIsoStr()).toBe("DUP DOUBLEBLAKE3");
  });

  test("toEbxBuf and fromEbxBuf", () => {
    const originalScript = Script.fromIsoStr("DUP DOUBLEBLAKE3");
    const arr = originalScript.toEbxBuf();
    const script = Script.fromEbxBuf(arr);
    expect(script.toIsoStr()).toBe("DUP DOUBLEBLAKE3");
  });

  test("toEbxBuf and fromEbxBuf with PUSHDATA1", () => {
    const originalScript = Script.fromIsoStr("0xff 0xff");
    const arr = originalScript.toEbxBuf();
    const script = Script.fromEbxBuf(arr);
    expect(script.toIsoStr()).toBe("0xff 0xff");
  });

  it("should correctly convert between string and EbxBuf for two PUSHDATA2 operations", () => {
    // Create a new Script from a string
    const initialScript = Script.fromIsoStr("0xffff 0xffff");

    // Convert the Script to a EbxBuf
    const arr = initialScript.toEbxBuf();

    // Create a new Script from the EbxBuf
    const finalScript = Script.fromEbxBuf(arr);

    // Convert the final Script back to a string
    const finalString = finalScript.toIsoStr();

    // Check that the final string matches the initial string
    expect(finalString).toEqual("0xffff 0xffff");
  });

  describe("pubkeyhash", () => {
    test("fromAddressOutput", () => {
      const script = Script.fromPkhOutput(SysBuf.from("01".repeat(32), "hex"));
      expect(script.toIsoStr()).toBe(
        "DUP DOUBLEBLAKE3 0x" + "01".repeat(32) + " EQUALVERIFY CHECKSIG",
      );
    });

    test("isAddressOutput", () => {
      const script = Script.fromPkhOutput(SysBuf.from("01".repeat(32), "hex"));
      expect(script.isPkhOutput()).toBe(true);
    });

    test("isAddressOutput false", () => {
      const script = Script.fromIsoStr(
        "DUP DOUBLEBLAKE3 0x01020304 EQUALVERIFY CHECKSIG",
      );
      expect(script.isPkhOutput()).toBe(false);
    });

    test("fromAddressInputPlacholder", () => {
      const script = Script.fromPkhInputPlaceholder();
      expect(script.isPkhInput()).toBe(true);
    });
  });

  describe("test vectors", () => {
    interface TestVectorScript {
      from_iso_buf: TestVectorErrors;
    }

    interface TestVectorErrors {
      errors: TestVectorError[];
    }

    interface TestVectorError {
      hex: string;
      error: string;
    }

    const filePath = path.resolve(__dirname, "../test-vectors/script.json");
    const jsonString = fs.readFileSync(filePath, "utf-8");
    const testVectors: TestVectorScript = JSON.parse(jsonString);

    test("test vectors: iso buf reader", () => {
      for (const test of testVectors.from_iso_buf.errors) {
        const arr = SysBuf.from(test.hex, "hex");
        const errorType =
          test.error === "non-minimal encoding"
            ? NonMinimalEncodingError
            : test.error === "not enough bytes in the buffer to read"
              ? NotEnoughDataError
              : GenericError;
        expect(() => Script.fromEbxBuf(arr)).toThrow(errorType);
      }
    });
  });
});
