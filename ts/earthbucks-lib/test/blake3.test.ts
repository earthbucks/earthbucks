import { describe, expect, test, beforeEach, it } from "vitest";
import * as Hash from "../src/hash.js";
import { SysBuf } from "../src/buf.js";

describe("blake3", () => {
  test("hash", () => {
    const pub_key_hex =
      "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722";
    const expected_pkh_hex =
      "38a12c6cf034632042b3b9deb2aabfdc798fac879d2f833638d59cf58549bc2d";

    // Convert hex to bytes
    const pub_key = SysBuf.from(pub_key_hex, "hex");
    const expected_pkh = SysBuf.from(expected_pkh_hex, "hex");

    // Compute the hash of the public key
    const pkh = SysBuf.from(Hash.blake3Hash(pub_key));

    // Check that the computed pkh matches the expected pkh
    expect(pkh.toString("hex")).toEqual(expected_pkh.toString("hex"));
  });

  test("doubleHash", () => {
    const pub_key_hex =
      "0341ee98513da8509fea0c89b81aca409e56f5aaa3076fb78233850ad0e54e2628";
    const expected_pkh_hex =
      "51544e51d07a92f41854bd2a14d0f33dcbc936b8910eb9c699b656cd89308132";

    // Convert hex to bytes
    const pub_key = SysBuf.from(pub_key_hex, "hex");
    const expected_pkh = SysBuf.from(expected_pkh_hex, "hex");

    // Compute the hash of the public key
    const pkh = SysBuf.from(Hash.doubleBlake3Hash(pub_key));

    // Check that the computed pkh matches the expected pkh
    expect(pkh.toString("hex")).toEqual(expected_pkh.toString("hex"));
  });

  test("blake3Mac", () => {
    const key = Hash.blake3Hash(SysBuf.from("key"));
    const data = SysBuf.from("data");
    const mac = SysBuf.from(Hash.blake3Mac(key, data));
    expect(mac.toString("hex")).toEqual(
      "438f903a8fc5997489497c30477dc32c5ece10f44049e302b85a83603960ec27",
    );
  });
});
