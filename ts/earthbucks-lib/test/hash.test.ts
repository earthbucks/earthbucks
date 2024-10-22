import { describe, expect, test, beforeEach, it } from "vitest";
import { Hash } from "../src/hash.js";
import { FixedBuf, WebBuf } from "../src/buf.js";

describe("blake3", () => {
  test("hash", () => {
    const pub_key_hex =
      "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722";
    const expected_pkh_hex =
      "38a12c6cf034632042b3b9deb2aabfdc798fac879d2f833638d59cf58549bc2d";

    // Convert hex to bytes
    const pub_key = WebBuf.from(pub_key_hex, "hex");
    const expected_pkh = WebBuf.from(expected_pkh_hex, "hex");

    // Compute the hash of the public key
    const pkh = Hash.blake3Hash(pub_key).buf;

    // Check that the computed pkh matches the expected pkh
    expect(pkh.toString("hex")).toEqual(expected_pkh.toString("hex"));
  });

  test("doubleHash", () => {
    const pub_key_hex =
      "0341ee98513da8509fea0c89b81aca409e56f5aaa3076fb78233850ad0e54e2628";
    const expected_pkh_hex =
      "51544e51d07a92f41854bd2a14d0f33dcbc936b8910eb9c699b656cd89308132";

    // Convert hex to bytes
    const pub_key = WebBuf.from(pub_key_hex, "hex");
    const expected_pkh = WebBuf.from(expected_pkh_hex, "hex");

    // Compute the hash of the public key
    const pkh = Hash.doubleBlake3Hash(pub_key).buf;

    // Check that the computed pkh matches the expected pkh
    expect(pkh.toString("hex")).toEqual(expected_pkh.toString("hex"));
  });

  describe("blake3Mac", () => {
    const key = Hash.blake3Hash(WebBuf.from("key"));
    const data = WebBuf.from("data");
    const mac = Hash.blake3Mac(key, data).buf;
    expect(mac.toString("hex")).toEqual(
      "438f903a8fc5997489497c30477dc32c5ece10f44049e302b85a83603960ec27",
    );

    test("should return a FixedBuf<32>", () => {
      const key = FixedBuf.fromHex(32, "0f".repeat(32));
      const data = FixedBuf.fromHex(31, "f0".repeat(31)).buf;
      const result = Hash.blake3Mac(key, data);
      expect(result.toHex()).toEqual(
        "46f66424c1cb3be92e623339cb0ef5df1a3a3c55de22135f7b658d362d9a6e9e",
      );
    });

    test("should return a FixedBuf<32>", () => {
      const key = FixedBuf.fromHex(32, "0f".repeat(32));
      const data = FixedBuf.fromHex(33, "f0".repeat(33)).buf;
      const result = Hash.blake3Mac(key, data);
      expect(result.toHex()).toEqual(
        "3251b3126f5de7f3621450105694096f91d592cb43f96e803644cafdf791a11b",
      );
    });

    test("should return a FixedBuf<32>", () => {
      const key = FixedBuf.fromHex(32, "0f".repeat(32));
      const data = FixedBuf.fromHex(32, "f0".repeat(32)).buf;
      const result = Hash.blake3Mac(key, data);
      expect(result.toHex()).toEqual(
        "40400457e60c7a6ab2c684c121bc7f3215f17be450fef773790dde7a2e133fdd",
      );
    });
  });
});
