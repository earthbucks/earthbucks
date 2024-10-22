// Import functions you want to test
import { describe, it, expect } from "vitest";
import { encrypt, decrypt, AES } from "../src/aes.js";
import { test_vectors } from "./vectors-aes.js";

type W4 = [number, number, number, number];
type W6 = [number, number, number, number, number, number];
type W8 = [number, number, number, number, number, number, number, number];

describe("AES Encryption Tests", () => {
  type Vec = {
    key: W4 | W6 | W8;
    pt: W4;
    ct: W4;
  };

  it("should encrypt data correctly", () => {
    const vec: Vec = {
      key: [0x00000000, 0x00000000, 0x00000000, 0x00000000],
      pt: [0xf34481ec, 0x3cc627ba, 0xcd5dc3fb, 0x08f273e6],
      ct: [0x0336763e, 0x966d9259, 0x5a567cc9, 0xce537f5e],
    };
    const aes = new AES(new Uint32Array(vec.key));
    const result = aes.encrypt(new Uint32Array(vec.pt));
    expect([...result]).toEqual(vec.ct);
  });

  for (const vec of test_vectors as Vec[]) {
    it(`should encrypt data correctly ${vec.key}`, () => {
      const aes = new AES(new Uint32Array(vec.key));
      const result = aes.encrypt(new Uint32Array(vec.pt));
      expect([...result]).toEqual(vec.ct);
    });

    it(`should decrypt data correctly ${vec.key}`, () => {
      const aes = new AES(new Uint32Array(vec.key));
      const decrypted = aes.decrypt(new Uint32Array(vec.ct));
      expect([...decrypted]).toEqual(vec.pt);
    });
  }
});
