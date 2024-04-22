import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Matmul from "../src/matmul";
import { Buffer } from "buffer";

describe("Matmul", () => {
  test("createSquareAndBlake3Hash 256", () => {
    // expected result for null input:
    // 5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f
    let matmul = new Matmul(new Uint8Array(32));
    let result = matmul.create256SquareAndBlake3Hash();
    let expected = result.toString("hex");
    expect(expected).toBe(
      "5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f",
    );
  });

  test("createSquareAndBlake3Hash 256 by hand", () => {
    // expected result for null input:
    // 5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f
    let matmul = new Matmul(new Uint8Array(32));
    let matrix = matmul.createBinary256Matrix();
    // print as giant grid of 1s and 0s, because each value is either 1 or 0
    for (let row of matrix.toArray() as number[][]) {
      //console.log(row.join(""));
      break;
    }
    let squared = matmul.squareMatrix(matrix);
    let squaredBufU16 = (squared.toArray() as number[][]).flat();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }
    //console.log(Buffer.from(squaredBufU8).toString('hex').slice(0, 64));

    let result = matmul.blake3Hash(Buffer.from(squaredBufU8));
    let expected = result.toString("hex");
    expect(expected).toBe(
      "5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f",
    );
  });
});
