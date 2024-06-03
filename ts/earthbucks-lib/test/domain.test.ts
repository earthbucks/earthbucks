import { describe, expect, test, beforeEach, it } from "vitest";
import { Domain } from "../src/domain.js";

describe("Domain", () => {
  describe("isValidDomain", () => {
    it("should test these known valid/invalid domains", () => {
      expect(Domain.fromStr("earthbucks.com").isValid()).toEqual(true);
      expect(Domain.fromStr("earthbucks.com.").isValid()).toEqual(false);
      expect(Domain.fromStr(".earthbucks.com").isValid()).toEqual(false);
      expect(
        Domain.fromStr("node.node.node.node.earthbucks.com").isValid(),
      ).toEqual(true);
      expect(
        Domain.fromStr(
          "node.node.node.node.node.node.node.node.node.earthbucks.com",
        ).isValid(),
      ).toEqual(false);
    });
  });
});
