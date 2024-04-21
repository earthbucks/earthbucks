import { describe, expect, test, beforeEach, it } from "@jest/globals";
import HeaderMine from "../src/header-mine";
import Header from "../src/header";

describe("HeaderMine", () => {
  test("getLowestIdForNTimes", () => {
    const header = new Header(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      BigInt(0),
      new Uint8Array(32),
      new Uint8Array(32),
      BigInt(0),
    );
    const headerMine = new HeaderMine(header);
    const lowest = headerMine.getLowestIdForNTimes(10);
    expect(lowest).toBeDefined();
    expect(lowest.num).toBeDefined();
  });

  test("getLowestNonceForNTimes", () => {
    const header = new Header(
      1,
      new Uint8Array(32),
      new Uint8Array(32),
      BigInt(0),
      new Uint8Array(32),
      new Uint8Array(32),
      BigInt(0),
    );
    const headerMine = new HeaderMine(header);
    const nonce = headerMine.getLowestNonceForNTimes(10);
    expect(nonce).toBeDefined();
  });
});
