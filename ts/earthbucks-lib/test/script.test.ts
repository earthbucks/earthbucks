import { describe, expect, test, beforeEach, it } from "vitest";
import { Script } from "../src/script.js";
import { SysBuf } from "../src/buf.js";
import fs from "fs";
import path from "path";
import {
  GenericError,
  NonMinimalEncodingError,
  NotEnoughDataError,
} from "../src/error.js";

describe("Script", () => {
  test("constructor", () => {
    const script = new Script();
    expect(script.chunks).toEqual([]);
  });

  test("fromStrictStr", () => {
    const script = Script.fromStrictStr("DUP DOUBLEBLAKE3");
    expect(script.chunks.length).toBe(2);
    expect(script.chunks[0].toStrictStr()).toBe("DUP");
    expect(script.chunks[1].toStrictStr()).toBe("DOUBLEBLAKE3");
  });

  test("fromStrictStr toString with PUSHDATA1", () => {
    const script = Script.fromStrictStr("0x00");
    expect(script.toStrictStr()).toBe("0x00");
  });

  test("fromStrictStr toString with PUSHDATA2", () => {
    const script = Script.fromStrictStr("0x" + "00".repeat(256));
    expect(script.toStrictStr()).toBe("0x" + "00".repeat(256));
  });

  test("toString", () => {
    const script = Script.fromStrictStr("DUP DOUBLEBLAKE3");
    expect(script.toStrictStr()).toBe("DUP DOUBLEBLAKE3");
  });

  test("toBuf and fromBuf", () => {
    const originalScript = Script.fromStrictStr("DUP DOUBLEBLAKE3");
    const arr = originalScript.toBuf();
    const script = Script.fromBuf(arr);
    expect(script.toStrictStr()).toBe("DUP DOUBLEBLAKE3");
  });

  test("toBuf and fromBuf with PUSHDATA1", () => {
    const originalScript = Script.fromStrictStr("0xff 0xff");
    const arr = originalScript.toBuf();
    const script = Script.fromBuf(arr);
    expect(script.toStrictStr()).toBe("0xff 0xff");
  });

  it("should correctly convert between string and EbxBuf for two PUSHDATA2 operations", () => {
    // Create a new Script from a string
    const initialScript = Script.fromStrictStr("0xffff 0xffff");

    // Convert the Script to a EbxBuf
    const arr = initialScript.toBuf();

    // Create a new Script from the EbxBuf
    const finalScript = Script.fromBuf(arr);

    // Convert the final Script back to a string
    const finalString = finalScript.toStrictStr();

    // Check that the final string matches the initial string
    expect(finalString).toEqual("0xffff 0xffff");
  });

  describe("pubkeyhash", () => {
    test("fromAddressOutput", () => {
      const script = Script.fromPkhOutput(SysBuf.from("01".repeat(32), "hex"));
      expect(script.toStrictStr()).toBe(
        "DUP DOUBLEBLAKE3 0x" + "01".repeat(32) + " EQUALVERIFY CHECKSIG",
      );
    });

    test("isAddressOutput", () => {
      const script = Script.fromPkhOutput(SysBuf.from("01".repeat(32), "hex"));
      expect(script.isPkhOutput()).toBe(true);
    });

    test("isAddressOutput false", () => {
      const script = Script.fromStrictStr(
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
        expect(() => Script.fromBuf(arr)).toThrow(errorType);
      }
    });
  });
});
