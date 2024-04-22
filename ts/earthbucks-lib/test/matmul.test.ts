import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Matmul from "../src/matmul";
import { Buffer } from "buffer";

describe("Matmul", () => {
  test("matmul256a", () => {
    // expected result for null input:
    // 5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f
    let matmul = new Matmul(new Uint8Array(32));
    let result = matmul.matmul256a();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f",
    );
  });
  test.skip("matmul256b", () => {
    // expected result for null input:
    // 912084a59eab9332d290fa93ca91496d3ce6075927fef6ca724e96ec3c590b8b
    let matmul = new Matmul(new Uint8Array(32));
    let result = matmul.matmul256b();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "912084a59eab9332d290fa93ca91496d3ce6075927fef6ca724e96ec3c590b8b",
    );
  });
});
