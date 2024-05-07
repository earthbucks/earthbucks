import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Script from "../src/script";
import { Buffer } from "buffer";

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

  test("toIsoBuf and fromU8Vec", () => {
    const originalScript = Script.fromIsoStr("DUP DOUBLEBLAKE3").unwrap();
    const arr = originalScript.toIsoBuf();
    const script = Script.fromIsoBuf(arr).unwrap();
    expect(script.toIsoStr().unwrap()).toBe("DUP DOUBLEBLAKE3");
  });

  test("toIsoBuf and fromU8Vec with PUSHDATA1", () => {
    const originalScript = Script.fromIsoStr("0xff 0xff").unwrap();
    const arr = originalScript.toIsoBuf();
    const script = Script.fromIsoBuf(arr).unwrap();
    expect(script.toIsoStr().unwrap()).toBe("0xff 0xff");
  });

  it("should correctly convert between string and Buffer for two PUSHDATA2 operations", () => {
    // Create a new Script from a string
    const initialScript = Script.fromIsoStr("0xffff 0xffff").unwrap();

    // Convert the Script to a Buffer
    const arr = initialScript.toIsoBuf();

    // Create a new Script from the Buffer
    const finalScript = Script.fromIsoBuf(arr).unwrap();

    // Convert the final Script back to a string
    const finalString = finalScript.toIsoStr().unwrap();

    // Check that the final string matches the initial string
    expect(finalString).toEqual("0xffff 0xffff");
  });

  describe("pubkeyhash", () => {
    test("fromAddressOutput", () => {
      const script = Script.fromAddressOutput(
        Buffer.from("01".repeat(32), "hex"),
      );
      expect(script.toIsoStr().unwrap()).toBe(
        "DUP DOUBLEBLAKE3 0x" + "01".repeat(32) + " EQUALVERIFY CHECKSIG",
      );
    });

    test("isAddressOutput", () => {
      const script = Script.fromAddressOutput(
        Buffer.from("01".repeat(32), "hex"),
      );
      expect(script.isAddressOutput()).toBe(true);
    });

    test("isAddressOutput false", () => {
      const script = Script.fromIsoStr(
        "DUP DOUBLEBLAKE3 0x01020304 EQUALVERIFY CHECKSIG",
      ).unwrap();
      expect(script.isAddressOutput()).toBe(false);
    });

    test("fromAddressInputPlacholder", () => {
      const script = Script.fromAddressInputPlaceholder();
      expect(script.isAddressInput()).toBe(true);
    });
  });
});
