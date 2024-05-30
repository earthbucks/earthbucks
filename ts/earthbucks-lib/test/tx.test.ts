import { describe, expect, test, beforeEach, it } from "vitest";
import { Tx, HashCache } from "../src/tx";
import { TxIn } from "../src/tx-in";
import { TxOut } from "../src/tx-out";
import { Script } from "../src/script";
import { IsoBufReader } from "../src/iso-buf-reader";
import { IsoBufWriter } from "../src/iso-buf-writer";
import * as Hash from "../src/hash";
import { TxSignature } from "../src/tx-signature";
import { KeyPair } from "../src/key-pair";
import { EbxBuffer } from "../src/ebx-buffer";

describe("Tx", () => {
  describe("constructor", () => {
    test("should create a Tx", () => {
      const version = 1;
      const inputs: TxIn[] = [];
      const outputs: TxOut[] = [];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);
      expect(tx).toBeInstanceOf(Tx);
      expect(tx.version).toBe(version);
      expect(tx.inputs).toBe(inputs);
      expect(tx.outputs).toBe(outputs);
      expect(tx.lockAbs).toBe(lockAbs);
    });
  });

  test("to/from u8Vec", () => {
    const version = 1;
    const inputs: TxIn[] = [new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0)];
    const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
    const lockAbs = BigInt(0);

    const tx = new Tx(version, inputs, outputs, lockAbs);
    const result = Tx.fromIsoBuf(tx.toIsoBuf()).unwrap();
    expect(tx.toIsoBuf().toString("hex")).toEqual(
      result.toIsoBuf().toString("hex"),
    );
  });

  describe("fromU8Vec", () => {
    test("fromU8Vec", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const result = Tx.fromIsoBuf(tx.toIsoBuf()).unwrap();
      expect(result).toBeInstanceOf(Tx);
      expect(result.version).toEqual(version);
      expect(result.inputs.length).toEqual(inputs.length);
      expect(result.outputs.length).toEqual(outputs.length);
      expect(result.lockAbs).toEqual(lockAbs);
    });
  });

  describe("fromIsoBufReader", () => {
    test("fromIsoBufReader", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const reader = new IsoBufReader(tx.toIsoBuf());
      const result = Tx.fromIsoBufReader(reader).unwrap();
      expect(result).toBeInstanceOf(Tx);
      expect(result.version).toEqual(version);
      expect(result.inputs.length).toEqual(inputs.length);
      expect(result.outputs.length).toEqual(outputs.length);
      expect(result.lockAbs).toEqual(lockAbs);
    });
  });

  describe("to/from string", () => {
    test("to/from string", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const result = Tx.fromIsoHex(tx.toIsoHex()).unwrap();
      expect(result).toBeInstanceOf(Tx);
      expect(result.version).toEqual(version);
      expect(result.inputs.length).toEqual(inputs.length);
      expect(result.outputs.length).toEqual(outputs.length);
      expect(result.lockAbs).toEqual(lockAbs);
    });
  });

  describe("fromCoinbase", () => {
    test("fromCoinbase", () => {
      const script = Script.fromIsoStr("DOUBLEBLAKE3").unwrap();
      const txInput = TxIn.fromCoinbase(script);
      expect(txInput).toBeInstanceOf(TxIn);
      expect(txInput.inputTxId.every((byte) => byte === 0)).toBe(true);
      expect(txInput.inputTxNOut).toBe(0xffffffff);
      expect(txInput.script.toIsoStr()).toEqual(script.toIsoStr());
      expect(txInput.lockRel).toBe(0);
    });
  });

  describe("isCoinbase", () => {
    test("isCoinbase", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0xffffffff, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);
      expect(tx.isCoinbase()).toBe(true);
    });

    test("is not coinbase", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);
      expect(tx.isCoinbase()).toBe(false);
    });

    test("fromCoinbase -> isCoinbase", () => {
      const script = Script.fromIsoStr("DOUBLEBLAKE3").unwrap();
      const txInput = TxIn.fromCoinbase(script);
      const tx = new Tx(1, [txInput], [], BigInt(0));
      expect(tx.isCoinbase()).toBe(true);
    });
  });

  describe("hashonce", () => {
    it("should return the hash of the tx", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);
      const expectedHash = Hash.blake3Hash(tx.toIsoBuf());
      expect(tx.blake3Hash()).toEqual(expectedHash);
    });
  });

  describe("hash", () => {
    it("should return the hash of the hash of the tx", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);
      const expectedHash = Hash.blake3Hash(Hash.blake3Hash(tx.toIsoBuf()));
      expect(tx.id()).toEqual(expectedHash);
    });
  });

  describe("sighash", () => {
    test("hashPrevouts", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const result = tx.hashPrevouts();

      expect(result).toBeInstanceOf(EbxBuffer);

      expect(EbxBuffer.from(result).toString("hex")).toEqual(
        "2cb9ad7c6db72bb07dae3873c8a28903510eb87fae097338bc058612af388fba",
      );
    });

    test("hashLockRel", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const result = tx.hashLockRel();

      expect(result).toBeInstanceOf(EbxBuffer);

      expect(EbxBuffer.from(result).toString("hex")).toEqual(
        "406986f514581cacbf3ab0fc3863b336d137af79318ce4bae553a91435773931",
      );
    });

    test("hashOutputs", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, new Script(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), new Script())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const result = tx.hashOutputs();

      expect(result).toBeInstanceOf(EbxBuffer);

      expect(EbxBuffer.from(result).toString("hex")).toEqual(
        "8c92e84e8b3b8b44690cbf64547018defaf43ade3b793ed8aa8ad33ae33941e5",
      );
    });

    test("sighash", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, Script.fromEmpty(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), Script.fromEmpty())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const script = Script.fromEmpty();
      const scriptU8Vec = script.toIsoBuf();
      const result = tx.sighashNoCache(
        0,
        scriptU8Vec,
        BigInt(1),
        TxSignature.SIGHASH_ALL,
      );

      expect(result).toBeInstanceOf(EbxBuffer);

      expect(EbxBuffer.from(result).toString("hex")).toEqual(
        "a4f4519c65fedfaf43b7cc989f1bcdd55b802738d70f06ea359f411315b71c51",
      );
    });

    test("sighash with cache", () => {
      const version = 1;
      const inputs: TxIn[] = [
        new TxIn(EbxBuffer.alloc(32), 0, Script.fromEmpty(), 0),
      ];
      const outputs: TxOut[] = [new TxOut(BigInt(100), Script.fromEmpty())];
      const lockAbs = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockAbs);

      const script = Script.fromEmpty();
      const scriptU8Vec = script.toIsoBuf();
      const hashCache = new HashCache();
      const result = tx.sighashWithCache(
        0,
        scriptU8Vec,
        BigInt(1),
        TxSignature.SIGHASH_ALL,
        hashCache,
      );

      expect(result).toBeInstanceOf(EbxBuffer);

      expect(EbxBuffer.from(result).toString("hex")).toEqual(
        "a4f4519c65fedfaf43b7cc989f1bcdd55b802738d70f06ea359f411315b71c51",
      );
    });

    describe("sign and verify", () => {
      it("should generate a deterministic signature", () => {
        // Arrange
        const inputIndex = 0;
        const privateKey = EbxBuffer.from(
          "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
          "hex",
        );
        const script = EbxBuffer.from([]);
        const amount = BigInt(100);
        const hashType = TxSignature.SIGHASH_ALL;
        const inputs: TxIn[] = [
          new TxIn(EbxBuffer.alloc(32), 0, Script.fromEmpty(), 0),
        ];
        const outputs: TxOut[] = [new TxOut(BigInt(100), Script.fromEmpty())];
        const tx = new Tx(1, inputs, outputs, BigInt(0));

        // Act
        const signature = tx.signNoCache(
          inputIndex,
          privateKey,
          script,
          amount,
          hashType,
        );

        // Assert
        const expectedSignatureHex =
          "0125c1e7312e2811c13952ea01e39f186cbc3077bef710ef11a363f88eae64ef0c657a1a6fd4bb488b69485f1ce7513fb3bab3cad418bc4f5093f648572f7fc89d"; // your expected signature in hex
        expect(EbxBuffer.from(signature.toIsoBuf()).toString("hex")).toEqual(
          expectedSignatureHex,
        );
      });

      it("should verify a deterministic signature", () => {
        // Arrange
        const inputIndex = 0;
        const privateKey = EbxBuffer.from(
          "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
          "hex",
        );
        const script = EbxBuffer.from([]);
        const amount = BigInt(100);
        const hashType = TxSignature.SIGHASH_ALL;
        const inputs: TxIn[] = [
          new TxIn(EbxBuffer.alloc(32), 0, Script.fromEmpty(), 0),
        ];
        // expect tx output to equal hext
        expect(inputs[0].toIsoBuf().toString("hex")).toEqual(
          "0000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        );
        const outputs: TxOut[] = [new TxOut(BigInt(100), Script.fromEmpty())];
        expect(outputs[0].toIsoBuf().toString("hex")).toEqual(
          "000000000000006400",
        );
        const tx = new Tx(1, inputs, outputs, BigInt(0));
        expect(tx.toIsoBuf().toString("hex")).toEqual(
          "01010000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000064000000000000000000",
        );

        // Act
        const signature = tx.signNoCache(
          inputIndex,
          privateKey,
          script,
          amount,
          hashType,
        );

        // Assert
        const expectedSignatureHex =
          "0125c1e7312e2811c13952ea01e39f186cbc3077bef710ef11a363f88eae64ef0c657a1a6fd4bb488b69485f1ce7513fb3bab3cad418bc4f5093f648572f7fc89d"; // your expected signature in hex
        expect(EbxBuffer.from(signature.toIsoBuf()).toString("hex")).toEqual(
          expectedSignatureHex,
        );
        const publicKey = KeyPair.fromPrivKeyEbxBuffer(privateKey)
          .unwrap()
          .pubKey.toIsoBuf();
        const result = tx.verifyNoCache(
          inputIndex,
          publicKey,
          signature,
          script,
          amount,
        );
        expect(result).toBe(true);
      });

      it("should verify a deterministic signature with hash cache", () => {
        // Arrange
        const inputIndex = 0;
        const privateKey = EbxBuffer.from(
          "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
          "hex",
        );
        const script = EbxBuffer.from([]);
        const amount = BigInt(100);
        const hashType = TxSignature.SIGHASH_ALL;
        const inputs: TxIn[] = [
          new TxIn(EbxBuffer.alloc(32), 0, Script.fromEmpty(), 0),
        ];
        // expect tx output to equal hext
        expect(inputs[0].toIsoBuf().toString("hex")).toEqual(
          "0000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        );
        const outputs: TxOut[] = [new TxOut(BigInt(100), Script.fromEmpty())];
        expect(outputs[0].toIsoBuf().toString("hex")).toEqual(
          "000000000000006400",
        );
        const tx = new Tx(1, inputs, outputs, BigInt(0));
        expect(tx.toIsoBuf().toString("hex")).toEqual(
          "01010000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000064000000000000000000",
        );
        const hashCache1 = new HashCache();

        // Act
        const signature = tx.signWithCache(
          inputIndex,
          privateKey,
          script,
          amount,
          hashType,
          hashCache1,
        );

        // Assert
        const expectedSignatureHex =
          "0125c1e7312e2811c13952ea01e39f186cbc3077bef710ef11a363f88eae64ef0c657a1a6fd4bb488b69485f1ce7513fb3bab3cad418bc4f5093f648572f7fc89d"; // your expected signature in hex
        expect(EbxBuffer.from(signature.toIsoBuf()).toString("hex")).toEqual(
          expectedSignatureHex,
        );
        const publicKey = KeyPair.fromPrivKeyEbxBuffer(privateKey)
          .unwrap()
          .pubKey.toIsoBuf();
        const hashCache2 = new HashCache();
        const result = tx.verifyWithCache(
          inputIndex,
          publicKey,
          signature,
          script,
          amount,
          hashCache2,
        );
        expect(result).toBe(true);
      });
    });
  });
});
