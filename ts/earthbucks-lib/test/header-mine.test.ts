import { describe, expect, test, beforeEach, it } from "vitest";
import { HeaderMine } from "../src/header-mine";
import { Header } from "../src/header";
import { EbxBuffer } from "../src/ebx-buffer";

describe("HeaderMine", () => {
  test("getLowestIdForNTimes", () => {
    const header = new Header(
      1,
      EbxBuffer.alloc(32),
      EbxBuffer.alloc(32),
      BigInt(0),
      BigInt(0),
      EbxBuffer.alloc(32),
      EbxBuffer.alloc(32),
      0,
      EbxBuffer.alloc(32),
      0,
      EbxBuffer.alloc(32),
    );
    const headerMine = new HeaderMine(header);
    const lowest = headerMine.getLowestIdForNTimes(10);
    expect(lowest).toBeDefined();
    expect(lowest.num).toBeDefined();
  });

  test("getLowestNonceForNTimes", () => {
    const header = new Header(
      1,
      EbxBuffer.alloc(32),
      EbxBuffer.alloc(32),
      BigInt(0),
      BigInt(0),
      EbxBuffer.alloc(32),
      EbxBuffer.alloc(32),
      0,
      EbxBuffer.alloc(32),
      0,
      EbxBuffer.alloc(32),
    );
    const headerMine = new HeaderMine(header);
    const nonce = headerMine.getLowestNonceForNTimes(10);
    expect(nonce).toBeDefined();
  });
});
