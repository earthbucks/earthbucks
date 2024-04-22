import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Matmul from "../src/matmul";
import { Buffer } from "buffer";

describe("Matmul", () => {
  test("matmul256a", () => {
    let matmul = new Matmul(new Uint8Array(32));
    let result = matmul.matmul256a();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f",
    );
  });

  test("matmul256b", () => {
    let matmul = new Matmul(new Uint8Array(32));
    let result = matmul.matmul256b();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "fc4e101ec4a9afaa432a12e8e5475158517a93d5f1b978b35bc392b521cda84b",
    );
  });

  test.skip("matmul1024", () => {
    let matmul = new Matmul(new Uint8Array(32));
    let result = matmul.matmul1024();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "3d90f78f711c271da4ab7afb11092ac3dc446570792231837f1bd28816dfde1c",
    );
  });
});
