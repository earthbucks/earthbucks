import { describe, expect, test, beforeEach, it } from "vitest";
import { ScriptNum } from "../src/script-num.js";
import { WebBuf } from "@webbuf/webbuf";

describe("ScriptNum", () => {
  const testCases = [
    { hex: "01", dec: "1" },
    { hex: "ff", dec: "-1" },
    { hex: "0100", dec: "256" },
    { hex: "ff00", dec: "-256" },
    { hex: "01000000", dec: "16777216" },
    { hex: "ff000000", dec: "-16777216" },
    { hex: "0100000000000000", dec: "72057594037927936" },
    { hex: "ff00000000000000", dec: "-72057594037927936" },
    {
      hex: "0100000000000000000000000000000000000000000000000000000000000000",
      dec: "452312848583266388373324160190187140051835877600158453279131187530910662656",
    },
    {
      hex: "ff00000000000000000000000000000000000000000000000000000000000000",
      dec: "-452312848583266388373324160190187140051835877600158453279131187530910662656",
    },
  ];

  for (const { hex, dec } of testCases) {
    test(`fromBuf correctly converts ${hex} to ${dec}`, () => {
      const buffer = WebBuf.from(hex, "hex");
      const scriptNum = ScriptNum.fromBuf(buffer);
      expect(scriptNum.num.toString()).toBe(dec);
    });
  }

  for (const { hex, dec } of testCases) {
    test(`toBuf correctly converts ${dec} to ${hex}`, () => {
      const scriptNum = new ScriptNum();
      scriptNum.num = BigInt(dec);
      const buffer = scriptNum.toBuf();
      expect(buffer.toString("hex")).toBe(hex);
    });
  }

  it("should correctly output positive numbers with the most significant bit set", () => {
    const num = ScriptNum.fromString("128"); // 128 is a positive number with the most significant bit set
    const buffer = num.toBuf();
    const hex = buffer.toString("hex");
    expect(hex).toEqual("0080"); // 128 in hexadecimal is 80, but we expect an extra '00' at the front
  });
});
