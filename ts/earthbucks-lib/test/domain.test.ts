import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Domain from "../src/domain";

describe("Domain", () => {
  describe("isValidDomain", () => {
    it("should test these known valid/invalid domains", () => {
      expect(Domain.fromIsoStr("earthbucks.com").isValid()).toEqual(true);
      expect(Domain.fromIsoStr("earthbucks.com.").isValid()).toEqual(false);
      expect(Domain.fromIsoStr(".earthbucks.com").isValid()).toEqual(false);
      expect(
        Domain.fromIsoStr("node.node.node.node.earthbucks.com").isValid(),
      ).toEqual(true);
      expect(
        Domain.fromIsoStr(
          "node.node.node.node.node.node.node.node.node.earthbucks.com",
        ).isValid(),
      ).toEqual(false);
    });
  });
});
