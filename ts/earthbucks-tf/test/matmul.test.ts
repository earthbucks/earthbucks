import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Matmul from "../src/matmul";
import { Buffer } from "buffer";

describe("Matmul", () => {
  test("matmul256", async () => {
    let matmul = new Matmul(new Uint8Array(32));
    let result = await matmul.matmul256();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "fc4e101ec4a9afaa432a12e8e5475158517a93d5f1b978b35bc392b521cda84b",
    );
  });

  test("matmul400", async () => {
    let matmul = new Matmul(new Uint8Array(32));
    let result = await matmul.matmul400();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "2ada02dbc002c6a7a6aa7c7ac6782c8b9a03537aa559a1ec23f47f390c593337",
    );
  });

  test("matmul512", async () => {
    let matmul = new Matmul(new Uint8Array(32));
    let result = await matmul.matmul512();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "12fdfe51e4d96ce46df7cfae08fb3ee9b026abdbc7749b5e4051a8ebcb351534",
    );
  });

  test("matmul1024", async () => {
    let matmul = new Matmul(new Uint8Array(32));
    let result = await matmul.matmul1024();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "3d90f78f711c271da4ab7afb11092ac3dc446570792231837f1bd28816dfde1c",
    );
  });
});
