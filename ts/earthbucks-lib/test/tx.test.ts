import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Tx, { HashCache } from "../src/tx";
import TxInput from "../src/tx-input";
import TxOutput from "../src/tx-output";
import Script from "../src/script";
import BufferReader from "../src/buffer-reader";
import BufferWriter from "../src/buffer-writer";
import { blake3Hash } from "../src/blake3";
import TxSignature from "../src/tx-signature";
import KeyPair from "../src/key-pair";
import { Buffer } from "buffer";

describe("Tx", () => {
  describe("constructor", () => {
    test("should create a Tx", () => {
      const version = 1;
      const inputs: TxInput[] = [];
      const outputs: TxOutput[] = [];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);
      expect(tx).toBeInstanceOf(Tx);
      expect(tx.version).toBe(version);
      expect(tx.inputs).toBe(inputs);
      expect(tx.outputs).toBe(outputs);
      expect(tx.lockNum).toBe(lockNum);
    });
  });

  test("to/from u8Vec", () => {
    const version = 1;
    const inputs: TxInput[] = [
      new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
    ];
    const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
    const lockNum = BigInt(0);

    const tx = new Tx(version, inputs, outputs, lockNum);
    const result = Tx.fromU8Vec(tx.toBuffer());
    expect(tx.toBuffer().toString("hex")).toEqual(
      result.toBuffer().toString("hex"),
    );
  });

  describe("fromU8Vec", () => {
    test("fromU8Vec", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const result = Tx.fromU8Vec(tx.toBuffer());
      expect(result).toBeInstanceOf(Tx);
      expect(result.version).toEqual(version);
      expect(result.inputs.length).toEqual(inputs.length);
      expect(result.outputs.length).toEqual(outputs.length);
      expect(result.lockNum).toEqual(lockNum);
    });
  });

  describe("fromBufferReader", () => {
    test("fromBufferReader", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const reader = new BufferReader(tx.toBuffer());
      const result = Tx.fromBufferReader(reader);
      expect(result).toBeInstanceOf(Tx);
      expect(result.version).toEqual(version);
      expect(result.inputs.length).toEqual(inputs.length);
      expect(result.outputs.length).toEqual(outputs.length);
      expect(result.lockNum).toEqual(lockNum);
    });
  });

  describe("to/from string", () => {
    test("to/from string", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const result = Tx.fromString(tx.toString());
      expect(result).toBeInstanceOf(Tx);
      expect(result.version).toEqual(version);
      expect(result.inputs.length).toEqual(inputs.length);
      expect(result.outputs.length).toEqual(outputs.length);
      expect(result.lockNum).toEqual(lockNum);
    });
  });

  describe("fromCoinbase", () => {
    test("fromCoinbase", () => {
      const script = new Script().fromString("DOUBLEBLAKE3");
      const txInput = TxInput.fromCoinbase(script);
      expect(txInput).toBeInstanceOf(TxInput);
      expect(txInput.inputTxId.every((byte) => byte === 0)).toBe(true);
      expect(txInput.inputTxNOut).toBe(0xffffffff);
      expect(txInput.script.toString()).toEqual(script.toString());
      expect(txInput.sequence).toBe(0xffffffff);
    });
  });

  describe("isCoinbase", () => {
    test("isCoinbase", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0xffffffff, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);
      expect(tx.isCoinbase()).toBe(true);
    });

    test("is not coinbase", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);
      expect(tx.isCoinbase()).toBe(false);
    });

    test("fromCoinbase -> isCoinbase", () => {
      const script = new Script().fromString("DOUBLEBLAKE3");
      const txInput = TxInput.fromCoinbase(script);
      const tx = new Tx(1, [txInput], [], BigInt(0));
      expect(tx.isCoinbase()).toBe(true);
    });
  });

  describe("hashonce", () => {
    it("should return the hash of the tx", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);
      const expectedHash = blake3Hash(tx.toBuffer());
      expect(tx.blake3Hash()).toEqual(expectedHash);
    });
  });

  describe("hash", () => {
    it("should return the hash of the hash of the tx", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);
      const expectedHash = blake3Hash(blake3Hash(tx.toBuffer()));
      expect(tx.id()).toEqual(expectedHash);
    });
  });

  describe("sighash", () => {
    test("hashPrevouts", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const result = tx.hashPrevouts();

      expect(result).toBeInstanceOf(Buffer);

      expect(Buffer.from(result).toString("hex")).toEqual(
        "2cb9ad7c6db72bb07dae3873c8a28903510eb87fae097338bc058612af388fba",
      );
    });

    test("hashSequence", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const result = tx.hashSequence();

      expect(result).toBeInstanceOf(Buffer);

      expect(Buffer.from(result).toString("hex")).toEqual(
        "5c9bc5bfc9fe60992fb5432ba6d5da1b5e232127b6a5678f93063b2d766cfbf5",
      );
    });

    test("hashOutputs", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ];
      const outputs: TxOutput[] = [new TxOutput(BigInt(100), new Script())];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const result = tx.hashOutputs();

      expect(result).toBeInstanceOf(Buffer);

      expect(Buffer.from(result).toString("hex")).toEqual(
        "8c92e84e8b3b8b44690cbf64547018defaf43ade3b793ed8aa8ad33ae33941e5",
      );
    });

    test("sighash", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, Script.fromString(""), 0xffffffff),
      ];
      const outputs: TxOutput[] = [
        new TxOutput(BigInt(100), Script.fromString("")),
      ];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const script = Script.fromString("");
      const scriptU8Vec = script.toBuffer();
      const result = tx.sighashNoCache(
        0,
        scriptU8Vec,
        BigInt(1),
        TxSignature.SIGHASH_ALL,
      );

      expect(result).toBeInstanceOf(Buffer);

      expect(Buffer.from(result).toString("hex")).toEqual(
        "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
      );
    });

    test("sighash with cache", () => {
      const version = 1;
      const inputs: TxInput[] = [
        new TxInput(Buffer.alloc(32), 0, Script.fromString(""), 0xffffffff),
      ];
      const outputs: TxOutput[] = [
        new TxOutput(BigInt(100), Script.fromString("")),
      ];
      const lockNum = BigInt(0);

      const tx = new Tx(version, inputs, outputs, lockNum);

      const script = Script.fromString("");
      const scriptU8Vec = script.toBuffer();
      const hashCache = new HashCache();
      const result = tx.sighashWithCache(
        0,
        scriptU8Vec,
        BigInt(1),
        TxSignature.SIGHASH_ALL,
        hashCache,
      );

      expect(result).toBeInstanceOf(Buffer);

      expect(Buffer.from(result).toString("hex")).toEqual(
        "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
      );
    });

    describe("sign and verify", () => {
      it("should generate a deterministic signature", () => {
        // Arrange
        const inputIndex = 0;
        const privateKey = Buffer.from(
          "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
          "hex",
        );
        const script = Buffer.from([]);
        const amount = BigInt(100);
        const hashType = TxSignature.SIGHASH_ALL;
        const inputs: TxInput[] = [
          new TxInput(Buffer.alloc(32), 0, Script.fromString(""), 0xffffffff),
        ];
        const outputs: TxOutput[] = [
          new TxOutput(BigInt(100), Script.fromString("")),
        ];
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
          "0176da08c70dd993c7d21f68e923f0f2585ca51a765b3a12f184176cc4277583bf544919a8c36ca9bd5d25d6b4b2a4ab6f303937725c134df86db82d78f627c7c3"; // your expected signature in hex
        expect(Buffer.from(signature.toBuffer()).toString("hex")).toEqual(
          expectedSignatureHex,
        );
      });

      it("should verify a deterministic signature", () => {
        // Arrange
        const inputIndex = 0;
        const privateKey = Buffer.from(
          "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
          "hex",
        );
        const script = Buffer.from([]);
        const amount = BigInt(100);
        const hashType = TxSignature.SIGHASH_ALL;
        const inputs: TxInput[] = [
          new TxInput(Buffer.alloc(32), 0, Script.fromString(""), 0xffffffff),
        ];
        // expect tx output to equal hext
        expect(inputs[0].toBuffer().toString("hex")).toEqual(
          "00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff",
        );
        const outputs: TxOutput[] = [
          new TxOutput(BigInt(100), Script.fromString("")),
        ];
        expect(outputs[0].toBuffer().toString("hex")).toEqual(
          "000000000000006400",
        );
        const tx = new Tx(1, inputs, outputs, BigInt(0));
        expect(tx.toBuffer().toString("hex")).toEqual(
          "010100000000000000000000000000000000000000000000000000000000000000000000000000ffffffff010000000000000064000000000000000000",
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
          "0176da08c70dd993c7d21f68e923f0f2585ca51a765b3a12f184176cc4277583bf544919a8c36ca9bd5d25d6b4b2a4ab6f303937725c134df86db82d78f627c7c3"; // your expected signature in hex
        expect(Buffer.from(signature.toBuffer()).toString("hex")).toEqual(
          expectedSignatureHex,
        );
        const publicKey =
          KeyPair.fromPrivKeyBuffer(privateKey).pubKey.toBuffer();
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
        const privateKey = Buffer.from(
          "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
          "hex",
        );
        const script = Buffer.from([]);
        const amount = BigInt(100);
        const hashType = TxSignature.SIGHASH_ALL;
        const inputs: TxInput[] = [
          new TxInput(Buffer.alloc(32), 0, Script.fromString(""), 0xffffffff),
        ];
        // expect tx output to equal hext
        expect(inputs[0].toBuffer().toString("hex")).toEqual(
          "00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff",
        );
        const outputs: TxOutput[] = [
          new TxOutput(BigInt(100), Script.fromString("")),
        ];
        expect(outputs[0].toBuffer().toString("hex")).toEqual(
          "000000000000006400",
        );
        const tx = new Tx(1, inputs, outputs, BigInt(0));
        expect(tx.toBuffer().toString("hex")).toEqual(
          "010100000000000000000000000000000000000000000000000000000000000000000000000000ffffffff010000000000000064000000000000000000",
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
          "0176da08c70dd993c7d21f68e923f0f2585ca51a765b3a12f184176cc4277583bf544919a8c36ca9bd5d25d6b4b2a4ab6f303937725c134df86db82d78f627c7c3"; // your expected signature in hex
        expect(Buffer.from(signature.toBuffer()).toString("hex")).toEqual(
          expectedSignatureHex,
        );
        const publicKey =
          KeyPair.fromPrivKeyBuffer(privateKey).pubKey.toBuffer();
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
