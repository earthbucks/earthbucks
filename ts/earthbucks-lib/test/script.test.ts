import { describe, expect, test, beforeEach, it } from "vitest";
import { Script } from "../src/script";
import { EbxBuffer } from "../src/ebx-buffer";
import fs from "fs";
import path from "path";

describe("Script", () => {
  test("constructor", () => {
    const script = new Script();
    expect(script.chunks).toEqual([]);
  });

  test("fromIsoStr", () => {
    const script = Script.fromIsoStr("DUP DOUBLEBLAKE3").unwrap();
    expect(script.chunks.length).toBe(2);
    expect(script.chunks[0].toIsoStr().unwrap()).toBe("DUP");
    expect(script.chunks[1].toIsoStr().unwrap()).toBe("DOUBLEBLAKE3");
  });

  test("fromIsoStr toString with PUSHDATA1", () => {
    const script = Script.fromIsoStr("0x00").unwrap();
    expect(script.toIsoStr().unwrap()).toBe("0x00");
  });

  test("fromIsoStr toString with PUSHDATA2", () => {
    const script = Script.fromIsoStr("0x" + "00".repeat(256)).unwrap();
    expect(script.toIsoStr().unwrap()).toBe("0x" + "00".repeat(256));
  });

  test("toString", () => {
    const script = Script.fromIsoStr("DUP DOUBLEBLAKE3").unwrap();
    expect(script.toIsoStr().unwrap()).toBe("DUP DOUBLEBLAKE3");
  });

  test("toIsoBuf and fromIsoBuf", () => {
    const originalScript = Script.fromIsoStr("DUP DOUBLEBLAKE3").unwrap();
    const arr = originalScript.toIsoBuf();
    const script = Script.fromIsoBuf(arr).unwrap();
    expect(script.toIsoStr().unwrap()).toBe("DUP DOUBLEBLAKE3");
  });

  test("toIsoBuf and fromIsoBuf with PUSHDATA1", () => {
    const originalScript = Script.fromIsoStr("0xff 0xff").unwrap();
    const arr = originalScript.toIsoBuf();
    const script = Script.fromIsoBuf(arr).unwrap();
    expect(script.toIsoStr().unwrap()).toBe("0xff 0xff");
  });

  it("should correctly convert between string and EbxBuffer for two PUSHDATA2 operations", () => {
    // Create a new Script from a string
    const initialScript = Script.fromIsoStr("0xffff 0xffff").unwrap();

    // Convert the Script to a EbxBuffer
    const arr = initialScript.toIsoBuf();

    // Create a new Script from the EbxBuffer
    const finalScript = Script.fromIsoBuf(arr).unwrap();

    // Convert the final Script back to a string
    const finalString = finalScript.toIsoStr().unwrap();

    // Check that the final string matches the initial string
    expect(finalString).toEqual("0xffff 0xffff");
  });

  describe("pubkeyhash", () => {
    test("fromAddressOutput", () => {
      const script = Script.fromPkhOutput(
        EbxBuffer.from("01".repeat(32), "hex"),
      );
      expect(script.toIsoStr().unwrap()).toBe(
        "DUP DOUBLEBLAKE3 0x" + "01".repeat(32) + " EQUALVERIFY CHECKSIG",
      );
    });

    test("isAddressOutput", () => {
      const script = Script.fromPkhOutput(
        EbxBuffer.from("01".repeat(32), "hex"),
      );
      expect(script.isPkhOutput()).toBe(true);
    });

    test("isAddressOutput false", () => {
      const script = Script.fromIsoStr(
        "DUP DOUBLEBLAKE3 0x01020304 EQUALVERIFY CHECKSIG",
      ).unwrap();
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
      for (const testVector of testVectors.from_iso_buf.errors) {
        const arr = EbxBuffer.from(testVector.hex, "hex");
        const result = Script.fromIsoBuf(arr);
        expect(result.err).toBeTruthy();
        expect(result.val.toString()).toMatch(
          new RegExp("^" + testVector.error),
        );
      }
    });
  });
});
