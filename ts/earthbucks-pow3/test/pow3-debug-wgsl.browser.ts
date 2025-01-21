import { describe, test, expect } from "vitest";
import { Pow3 } from "../src/pow3-debug-wgsl.js";
import { WebBuf, FixedBuf, Hash } from "@earthbucks/lib";

describe("Pow3 tests", async () => {
  test("debug: get header hash", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeroes);
      const result = await pow3.debugGetHeaderHash();
      expect(result.toHex()).toBe(
        "087fe55d46b5fac5e233bc72e9f0392365dac5ff09cee4278caca86691771625",
      );
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("ff".repeat(217)),
      );
      const pow3 = new Pow3(headerAllOnes);
      const result = await pow3.debugGetHeaderHash();
      expect(result.toHex()).toBe(
        "26563dabef1b8403f0e06f144ccf9d392affbf7ec116fe335dc16eca3e11917e",
      );
    }
  });

  test("debug: get many hash 1", async () => {
    {
      const headerAllZeros = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeros);
      const result = await pow3.debugGetManyHash1();
      // expect(result.toHex()).toBe(
      //   "",
      // );
      expect(Hash.blake3Hash(result.buf).toHex()).toBe(
        "c6a6e89b4861bb3404341e50f3653b701259903ba3e4587c9c85e7b37a7128fb",
      );
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("ff".repeat(217)),
      );
      const pow3 = new Pow3(headerAllOnes);
      const result = await pow3.debugGetManyHash1();
      // expect(result.toHex()).toBe(
      //   "",
      // );
      expect(Hash.blake3Hash(result.buf).toHex()).toBe(
        "e4bb1e3ff61479f73ee5d0a5cc7e7cccc0762c645ceefd00e54520e3ff54a072",
      );
    }
  });

  test("debug: get m1", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeroes);
      const result = await pow3.debugGetM1();
      const result_uint8array = new Uint8Array(result);
      const result_webbuf = WebBuf.fromUint8Array(result_uint8array);
      // expect(result_webbuf.toHex()).toEqual(
      //   "",
      // );
      expect(Hash.blake3Hash(result_webbuf).toHex()).toBe(
        "90b0ab6912eab949f9e9bd50272952152450c6260f5d643779e0555e5e65abc7",
      );
    }
  });

  test("debug: get m2", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeroes);
      const result = await pow3.debugGetM2();
      const result_uint8array = new Uint8Array(result);
      const result_webbuf = WebBuf.fromUint8Array(result_uint8array);
      // expect(result_webbuf.toHex()).toEqual(
      //   "",
      // );
      expect(Hash.blake3Hash(result_webbuf).toHex()).toBe(
        "6ec15e11779d066e167ef9d366fd2b5cdedca99a3ab15193dc2c28f827c9bcb2",
      );
    }
  });

  test("debug: get m3", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeroes);
      const result = await pow3.debugGetM3();
      const result_webbuf = WebBuf.fromUint8Array(
        new Uint8Array(result.buffer),
      );
      // WARNING: too long to copy
      // expect(result_webbuf.toHex()).toEqual("");
      expect(Hash.blake3Hash(result_webbuf).toHex()).toEqual(
        "5fcdbe59e130f42fbae86c8fb390956e52c1359cc07dccd6e8079d9741d5856a",
      );
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow3 = new Pow3(headerAllOnes);
      const result = await pow3.debugGetM3();
      const result_webbuf = WebBuf.fromUint8Array(
        new Uint8Array(result.buffer),
      );
      // WARNING: too long to copy
      // expect(result_webbuf.toHex()).toEqual("");
      expect(Hash.blake3Hash(result_webbuf).toHex()).toEqual(
        "b9c7ce598308e6d3f945234bbb1a0cf88eccaa96ea5905fe5f982319f192676e",
      );
    }
  });

  test("debug: get m4", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeroes);
      const result = await pow3.debugGetM4();
      const result_webbuf = WebBuf.fromUint8Array(
        new Uint8Array(result.buffer),
      );
      // WARNING: too long to copy
      // expect(result_webbuf.toHex()).toEqual("");
      expect(Hash.blake3Hash(result_webbuf).toHex()).toEqual(
        "42966742faaf1c122d998ffbb1fc3d828721759628a239628c876ad31d780242",
      );
    }
  });

  test("debug: get m4 bytes", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeroes);
      const result = await pow3.debugGetM4Bytes();
      const result_webbuf = WebBuf.fromUint8Array(new Uint8Array(result));
      // WARNING: too long to copy
      // expect(result_webbuf.toHex()).toEqual("");
      expect(Hash.blake3Hash(result_webbuf).toHex()).toEqual(
        "3a8ce04b8f9875e23771128834760257ccfff4274c10a070b1ca808aa331c75f",
      );
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("ff".repeat(217)),
      );
      const pow3 = new Pow3(headerAllOnes);
      const result = await pow3.debugGetM4Bytes();
      const result_webbuf = WebBuf.fromUint8Array(new Uint8Array(result));
      // WARNING: too long to copy
      // expect(result_webbuf.toHex()).toEqual("");
      expect(Hash.blake3Hash(result_webbuf).toHex()).toEqual(
        "5870a687af09f268c079c8ac41ae3a043f283f4ed9fde6912e749b67ee6a5073",
      );
    }
  });

  test("debug: get final hash", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow3 = new Pow3(headerAllZeroes);
      const result = await pow3.debugGetFinalHash();
      expect(result.toHex()).toBe(
        "6b9a2ba400b5e2918c3e348186636fc49f07830e341f8eaa37744b580197e670",
      );
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow3 = new Pow3(headerAllOnes);
      const result = await pow3.debugGetFinalHash();
      expect(result.toHex()).toBe(
        "f20bfe55448a00ba295ef37df2382670978d5f4ed3589ed7788799bf43f208aa",
      );
    }
  });
});
