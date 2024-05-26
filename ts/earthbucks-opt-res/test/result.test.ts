import { describe, expect, test } from "vitest";
import { Result, Ok, Err } from "../src/result";

describe("Result", () => {
  function myFunc(n: number): Result<number, string> {
    if (n === 42) {
      return Ok(n);
    } else {
      return Err("Not 42");
    }
  }
  test("Ok", () => {
    expect(myFunc(42)).toEqual(Ok(42));
    expect(myFunc(42).ok).toEqual(true);
    expect(myFunc(41).ok).toEqual(false);
  });
});
