import { describe, expect, test, beforeEach, it } from "vitest";
import { MerkleProof } from "../src/merkle-proof";
import * as Hash from "../src/hash";
import { IsoBuf } from "../src/iso-buf";

describe("MerkleProof", () => {
  test("generateProofsAndRoot with 1 data", () => {
    const data1 = Hash.doubleBlake3Hash(IsoBuf.from("data1"));

    const data = [data1];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data).unwrap();
    const hex = IsoBuf.from(root).toString("hex");
    expect(hex).toBe(
      "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244",
    );

    const proof1 = proofs[0];
    const verified1 = MerkleProof.verifyProof(data1, proof1, root);
    expect(verified1).toBe(true);
  });

  test("generateProofsAndRoot with 2 datas", () => {
    const data1 = Hash.doubleBlake3Hash(IsoBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(IsoBuf.from("data2"));

    const data = [data1, data2];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data).unwrap();
    const hex = IsoBuf.from(root).toString("hex");
    expect(hex).toBe(
      "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde",
    );

    const proof1 = proofs[0];
    const verified1 = MerkleProof.verifyProof(data1, proof1, root);
    expect(verified1).toBe(true);

    const proof2 = proofs[1];
    const verified2 = MerkleProof.verifyProof(data2, proof2, root);
    expect(verified2).toBe(true);
  });

  test("generateProofsAndRoot with 3 datas", () => {
    const data1 = Hash.doubleBlake3Hash(IsoBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(IsoBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(IsoBuf.from("data3"));

    const data = [data1, data2, data3];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data).unwrap();
    const hex = IsoBuf.from(root).toString("hex");
    expect(hex).toBe(
      "30a6a79ea9df78385494a1df6a6eeb4fcf318929899fd0b6c96bba0724bcecdf",
    );
    const proof1 = proofs[0];
    const verified1 = MerkleProof.verifyProof(data1, proof1, root);

    expect(verified1).toBe(true);

    const proof2 = proofs[1];
    const verified2 = MerkleProof.verifyProof(data2, proof2, root);
    expect(verified2).toBe(true);

    const proof3 = proofs[2];
    const verified3 = MerkleProof.verifyProof(data3, proof3, root);
    expect(verified3).toBe(true);
  });

  test("generateProofsAndRoot with 4 datas", () => {
    const data1 = Hash.doubleBlake3Hash(IsoBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(IsoBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(IsoBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(IsoBuf.from("data4"));

    const data = [data1, data2, data3, data4];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data).unwrap();
    const hex = IsoBuf.from(root).toString("hex");
    expect(hex).toBe(
      "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187",
    );

    const proof1 = proofs[0];
    const verified1 = MerkleProof.verifyProof(data1, proof1, root);
    expect(verified1).toBe(true);

    const proof2 = proofs[1];
    const verified2 = MerkleProof.verifyProof(data2, proof2, root);
    expect(verified2).toBe(true);

    const proof3 = proofs[2];
    const verified3 = MerkleProof.verifyProof(data3, proof3, root);
    expect(verified3).toBe(true);

    const proof4 = proofs[3];
    const verified4 = MerkleProof.verifyProof(data4, proof4, root);
    expect(verified4).toBe(true);
  });

  test("generate proofs and root with non-unique data", () => {
    const data1 = Hash.doubleBlake3Hash(IsoBuf.from("data1"));

    const data = [data1, IsoBuf.from(data1)];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data).unwrap();
    const hex = IsoBuf.from(root).toString("hex");
    expect(hex).toBe(
      "b008a98b438e9964e43bb0b46d985b5750d1bb5831ac97c8bb05868351b221a3",
    );

    const proof1 = proofs[0];
    const verified1 = MerkleProof.verifyProof(data1, proof1, root);
    expect(verified1).toBe(true);

    const proof2 = proofs[1];
    const verified2 = MerkleProof.verifyProof(data1, proof2, root);
    expect(verified2).toBe(true);
  });

  test("to/from Buf", () => {
    const data1 = Hash.doubleBlake3Hash(IsoBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(IsoBuf.from("data2"));

    const data = [data1, data2];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data).unwrap();

    const proof1 = proofs[0];
    const buf1 = proof1.toIsoBuf();
    const proof1FromBuf = MerkleProof.fromIsoBuf(buf1);
    const buf2 = proof1FromBuf.toIsoBuf();
    expect(IsoBuf.compare(buf1, buf2)).toBe(0);
  });

  test("to/from string", () => {
    const data1 = Hash.doubleBlake3Hash(IsoBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(IsoBuf.from("data2"));

    const data = [data1, data2];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data).unwrap();

    const proof1 = proofs[0];
    const str = proof1.toIsoStr();
    const proof1FromString = MerkleProof.fromIsoStr(str);
    const str2 = proof1FromString.toIsoStr();
    expect(str).toBe(str2);
  });
});
