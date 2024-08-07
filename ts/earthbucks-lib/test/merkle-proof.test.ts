import { describe, expect, test, beforeEach, it } from "vitest";
import { MerkleProof } from "../src/merkle-proof.js";
import { Hash } from "../src/hash.js";
import { SysBuf } from "../src/buf.js";

describe("MerkleProof", () => {
  test("generateProofsAndRoot with 1 data", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));

    const data = [data1];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data);
    const hex = SysBuf.from(root.buf).toString("hex");
    expect(hex).toBe(
      "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244",
    );

    const proof1 = proofs[0] as MerkleProof;
    const verified1 = MerkleProof.verifyProof(data1.buf, proof1, root.buf);
    expect(verified1).toBe(true);
  });

  test("generateProofsAndRoot with 2 datas", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));

    const data = [data1, data2];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data);
    const hex = SysBuf.from(root.buf).toString("hex");
    expect(hex).toBe(
      "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde",
    );

    const proof1 = proofs[0] as MerkleProof;
    const verified1 = MerkleProof.verifyProof(data1.buf, proof1, root.buf);
    expect(verified1).toBe(true);

    const proof2 = proofs[1] as MerkleProof;
    const verified2 = MerkleProof.verifyProof(data2.buf, proof2, root.buf);
    expect(verified2).toBe(true);
  });

  test("generateProofsAndRoot with 3 datas", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));

    const data = [data1, data2, data3];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data);
    const hex = SysBuf.from(root.buf).toString("hex");
    expect(hex).toBe(
      "a30fb8877ea729e759aa7f847d0232d6620721ab73a57aa4b31f26075c1901a3",
    );
    const proof1 = proofs[0] as MerkleProof;
    const verified1 = MerkleProof.verifyProof(data1.buf, proof1, root.buf);

    expect(verified1).toBe(true);

    const proof2 = proofs[1] as MerkleProof;
    const verified2 = MerkleProof.verifyProof(data2.buf, proof2, root.buf);
    expect(verified2).toBe(true);

    const proof3 = proofs[2] as MerkleProof;
    const verified3 = MerkleProof.verifyProof(data3.buf, proof3, root.buf);
    expect(verified3).toBe(true);
  });

  test("generateProofsAndRoot with 4 datas", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));

    const data = [data1, data2, data3, data4];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data);
    const hex = SysBuf.from(root.buf).toString("hex");
    expect(hex).toBe(
      "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187",
    );

    const proof1 = proofs[0] as MerkleProof;
    const verified1 = MerkleProof.verifyProof(data1.buf, proof1, root.buf);
    expect(verified1).toBe(true);

    const proof2 = proofs[1] as MerkleProof;
    const verified2 = MerkleProof.verifyProof(data2.buf, proof2, root.buf);
    expect(verified2).toBe(true);

    const proof3 = proofs[2] as MerkleProof;
    const verified3 = MerkleProof.verifyProof(data3.buf, proof3, root.buf);
    expect(verified3).toBe(true);

    const proof4 = proofs[3] as MerkleProof;
    const verified4 = MerkleProof.verifyProof(data4.buf, proof4, root.buf);
    expect(verified4).toBe(true);
  });

  test("generate proofs and root with non-unique data", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));

    const data = [data1, data1];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data);
    const hex = SysBuf.from(root.buf).toString("hex");
    expect(hex).toBe(
      "b008a98b438e9964e43bb0b46d985b5750d1bb5831ac97c8bb05868351b221a3",
    );

    const proof1 = proofs[0] as MerkleProof;
    const verified1 = MerkleProof.verifyProof(data1.buf, proof1, root.buf);
    expect(verified1).toBe(true);

    const proof2 = proofs[1] as MerkleProof;
    const verified2 = MerkleProof.verifyProof(data1.buf, proof2, root.buf);
    expect(verified2).toBe(true);
  });

  test("to/from Buf", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));

    const data = [data1, data2];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data);

    const proof1 = proofs[0] as MerkleProof;
    const buf1 = proof1.toBuf();
    const proof1FromBuf = MerkleProof.fromBuf(buf1);
    const buf2 = proof1FromBuf.toBuf();
    expect(SysBuf.compare(buf1, buf2)).toBe(0);
  });

  test("to/from string", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));

    const data = [data1, data2];
    const [root, proofs] = MerkleProof.generateProofsAndRoot(data);

    const proof1 = proofs[0] as MerkleProof;
    const str = proof1.toString();
    const proof1FromString = MerkleProof.fromString(str);
    const str2 = proof1FromString.toString();
    expect(str).toBe(str2);
  });
});
