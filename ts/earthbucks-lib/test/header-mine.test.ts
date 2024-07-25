import { describe, expect, test, beforeEach, it } from "vitest";
import { HeaderMine } from "../src/header-mine.js";
import { Header } from "../src/header.js";
import { SysBuf, FixedBuf } from "../src/buf.js";
import { U8, U16, U32, U64, U128, U256 } from "../src/numbers.js";

describe("HeaderMine", () => {
  test("getLowestIdForNTimes", () => {
    const header = new Header();
    const headerMine = new HeaderMine(header);
    const lowest = headerMine.getLowestIdForNTimes(10);
    expect(lowest).toBeDefined();
    expect(lowest.bn).toBeDefined();
  });

  test("getLowestNonceForNTimes", () => {
    const header = new Header();
    const headerMine = new HeaderMine(header);
    const nonce = headerMine.getLowestNonceForNTimes(10);
    expect(nonce).toBeDefined();
  });
});
