import { describe, test, expect } from "vitest";
import { Pow5 } from "../src/pow5-wgsl.js";
import { WebBuf, FixedBuf, Hash } from "@earthbucks/lib";

const MAX_GRID_SIZE = 32768;

describe("Pow5 tests", async () => {
  test("placeholder test", async () => {});

  test("debug: hash header", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow5 = new Pow5(headerAllZeroes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugHashHeader();
      expect(result.hash.toHex()).toBe(
        "34b859ca751e26920aeb47b8e1e755f87293bda150c8cdc854964b7df7821bcf",
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(headerAllZeroes.buf).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow5 = new Pow5(headerAllOnes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugHashHeader();
      expect(result.hash.toHex()).toBe(
        "eb5f30bf6c299ef06fdfacc33391bc98c02cfae075590661d765c0d661f32a7b"
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(headerAllOnes.buf).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }
  });

  test("debug: double hash header", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow5 = new Pow5(headerAllZeroes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugDoubleHashHeader();
      expect(result.hash.toHex()).toBe(
        "f9d4c67f087b979dde480d0eb3bf99871ff09c6960f5aaa2a13a88092e2a0c29",
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(Hash.blake3Hash(headerAllZeroes.buf).buf).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow5 = new Pow5(headerAllOnes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugDoubleHashHeader();
      expect(result.hash.toHex()).toBe(
        "3d6545532ad22b8cafc7573464be25054391b6e2e6ded794e66e820cc4feb05f"
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(Hash.blake3Hash(headerAllOnes.buf).buf).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }
  });

  test("debug: hash header 128", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow5 = new Pow5(headerAllZeroes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugHashHeader128();
      expect(result.hash.toHex()).toBe(
        "272fc82430c30a4f9f58df84a1fe3f1454be77df572c23cced4d5e003a60918f",
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(headerAllZeroes.buf.slice(0, 128)).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow5 = new Pow5(headerAllOnes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugHashHeader128();
      expect(result.hash.toHex()).toBe(
        "14f3387c61e89f7a1bce077da2d41df2da920f35f376769ee70aa4ca9620d1b7"
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(headerAllOnes.buf.slice(0, 128)).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }
  });

  test("debug: hash header 32", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow5 = new Pow5(headerAllZeroes);
      await pow5.init(true);
      const result = await pow5.debugHashHeader32();
      expect(result.hash.toHex()).toBe(
        "2ada83c1819a5372dae1238fc1ded123c8104fdaa15862aaee69428a1820fcda",
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(headerAllZeroes.buf.slice(0, 32)).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow5 = new Pow5(headerAllOnes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugHashHeader32();
      expect(result.hash.toHex()).toBe(
        "91f47563f3da92036f6fb227245b2833d0b42d76b1cc04afe198e92cf3749f61"
      );
      expect(result.nonce).toBe(0);

      // now, generate the same hash with Hash
      const hashHex = Hash.blake3Hash(headerAllOnes.buf.slice(0, 32)).toHex();
      expect(result.hash.toHex()).toBe(hashHex);
    }
  });

  test("debug: get work par", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow5 = new Pow5(headerAllZeroes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugGetWorkPar();
      expect(result.hash.toHex()).toBe(
        "6fe9eddc39bb4183c44853c41876801be94a138ea9adea89f40a08442d2f79b8",
      );
      expect(result.nonce).toBe(0);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow5 = new Pow5(headerAllOnes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugGetWorkPar();
      expect(result.hash.toHex()).toBe(
        "09d125453a1a5e9f75c770e3580e8b8035069b39816036b38207e8e152fa6871"
      );
      expect(result.nonce).toBe(0);
    }
  });

  test("debug: elementary iteration", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow5 = new Pow5(headerAllZeroes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugElementaryIteration();
      expect(result.hash.toHex()).toBe(
        "c88f591bfa80126e9a14d76d473ca8ae7ac578ed1eac0150fcbc06742f4f7d6f",
      );
      expect(result.nonce).toBe(0);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow5 = new Pow5(headerAllOnes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.debugElementaryIteration();
      expect(result.hash.toHex()).toBe(
        "a0c84664c6489150ffdd9755c5fad8fe08339d923ad2a3fda6369e1e74be9184"
      );
      expect(result.nonce).toBe(0);
    }
  });

  test("work", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow5 = new Pow5(headerAllZeroes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.work();
      expect(result.hash.toHex()).toBe(
        "00000004f0ac89d75f135f184abbf0a82fad1e07fb4a29adb159648d70adf474",
      );
      expect(result.nonce).toBe(376413);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow5 = new Pow5(headerAllOnes, MAX_GRID_SIZE);
      await pow5.init(true);
      const result = await pow5.work();
      expect(result.hash.toHex()).toBe(
        "0000004bd2d60b7b67702281a87b14e45c65d40465dc41fa2639ef84f050164a"
      );
      expect(result.nonce).toBe(424378);
    }
  });
});
