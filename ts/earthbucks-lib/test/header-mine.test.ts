import { describe, expect, test, beforeEach, it } from "vitest";
import { HeaderMine } from "../src/header-mine.js";
import { Header } from "../src/header.js";
import { SysBuf, FixedIsoBuf } from "../src/iso-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("HeaderMine", () => {
  test("getLowestIdForNTimes", () => {
    const header = new Header(
      new U32(1),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U64(0n),
      new U64(0n),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
    );
    const headerMine = new HeaderMine(header);
    const lowest = headerMine.getLowestIdForNTimes(10);
    expect(lowest).toBeDefined();
    expect(lowest.num).toBeDefined();
  });

  test("getLowestNonceForNTimes", () => {
    const header = new Header(
      new U32(1),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U64(0n),
      new U64(0n),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
    );
    const headerMine = new HeaderMine(header);
    const nonce = headerMine.getLowestNonceForNTimes(10);
    expect(nonce).toBeDefined();
  });
});
