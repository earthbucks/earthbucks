import { describe, expect, test, beforeEach, it } from '@jest/globals'
import Transaction from '../src/transaction'
import TransactionInput from '../src/transaction-input'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'
import BufferReader from '../src/buffer-reader'
import BufferWriter from '../src/buffer-writer'
import { blake3Hash } from '../src/blake3'
import TransactionSignature from '../src/transaction-signature'
import Key from '../src/key'

describe('Transaction', () => {
  describe('constructor', () => {
    test('should create a Transaction', () => {
      const version = 1
      const inputs: TransactionInput[] = []
      const outputs: TransactionOutput[] = []
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)
      expect(transaction).toBeInstanceOf(Transaction)
      expect(transaction.version).toBe(version)
      expect(transaction.inputs).toBe(inputs)
      expect(transaction.outputs).toBe(outputs)
      expect(transaction.locktime).toBe(locktime)
    })
  })

  test('to/from u8Vec', () => {
    const version = 1
    const inputs: TransactionInput[] = [
      new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
    ]
    const outputs: TransactionOutput[] = [
      new TransactionOutput(BigInt(100), new Script()),
    ]
    const locktime = BigInt(0)

    const transaction = new Transaction(version, inputs, outputs, locktime)
    const result = Transaction.fromU8Vec(transaction.toU8Vec())
    expect(transaction.toBuffer().toString('hex')).toEqual(
      result.toBuffer().toString('hex'),
    )
  })

  describe('fromU8Vec', () => {
    test('fromU8Vec', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const result = Transaction.fromU8Vec(transaction.toU8Vec())
      expect(result).toBeInstanceOf(Transaction)
      expect(result.version).toEqual(version)
      expect(result.inputs.length).toEqual(inputs.length)
      expect(result.outputs.length).toEqual(outputs.length)
      expect(result.locktime).toEqual(locktime)
    })
  })

  describe('fromBufferReader', () => {
    test('fromBufferReader', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const reader = new BufferReader(transaction.toBuffer())
      const result = Transaction.fromBufferReader(reader)
      expect(result).toBeInstanceOf(Transaction)
      expect(result.version).toEqual(version)
      expect(result.inputs.length).toEqual(inputs.length)
      expect(result.outputs.length).toEqual(outputs.length)
      expect(result.locktime).toEqual(locktime)
    })
  })

  describe('hashonce', () => {
    it('should return the hash of the transaction', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)
      const expectedHash = blake3Hash(transaction.toU8Vec())
      expect(transaction.blake3Hash()).toEqual(expectedHash)
    })
  })

  describe('hash', () => {
    it('should return the hash of the hash of the transaction', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)
      const expectedHash = blake3Hash(blake3Hash(transaction.toU8Vec()))
      expect(transaction.id()).toEqual(expectedHash)
    })
  })

  describe('sighash', () => {
    test('hashPrevouts', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const result = transaction.hashPrevouts()

      expect(result).toBeInstanceOf(Uint8Array)

      expect(Buffer.from(result).toString('hex')).toEqual(
        '2cb9ad7c6db72bb07dae3873c8a28903510eb87fae097338bc058612af388fba',
      )
    })

    test('hashSequence', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const result = transaction.hashSequence()

      expect(result).toBeInstanceOf(Uint8Array)

      expect(Buffer.from(result).toString('hex')).toEqual(
        '5c9bc5bfc9fe60992fb5432ba6d5da1b5e232127b6a5678f93063b2d766cfbf5',
      )
    })

    test('hashOutputs', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const result = transaction.hashOutputs()

      expect(result).toBeInstanceOf(Uint8Array)

      expect(Buffer.from(result).toString('hex')).toEqual(
        '8c92e84e8b3b8b44690cbf64547018defaf43ade3b793ed8aa8ad33ae33941e5',
      )
    })

    test('sighash', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(
          Buffer.alloc(32),
          0,
          Script.fromString(''),
          0xffffffff,
        ),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), Script.fromString('')),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const script = Script.fromString('')
      const scriptU8Vec = script.toU8Vec()
      const result = transaction.sighash(
        0,
        scriptU8Vec,
        BigInt(1),
        TransactionSignature.SIGHASH_ALL,
      )

      expect(result).toBeInstanceOf(Uint8Array)

      expect(Buffer.from(result).toString('hex')).toEqual(
        '7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad',
      )
    })

    describe('sign and verify', () => {
      it('should generate a deterministic signature', () => {
        // Arrange
        const inputIndex = 0
        const privateKey = new Uint8Array(
          Buffer.from(
            '7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad',
            'hex',
          ),
        )
        const script = new Uint8Array([])
        const amount = BigInt(100)
        const hashType = TransactionSignature.SIGHASH_ALL
        const inputs: TransactionInput[] = [
          new TransactionInput(
            Buffer.alloc(32),
            0,
            Script.fromString(''),
            0xffffffff,
          ),
        ]
        const outputs: TransactionOutput[] = [
          new TransactionOutput(BigInt(100), Script.fromString('')),
        ]
        const transaction = new Transaction(1, inputs, outputs, BigInt(0))

        // Act
        const signature = transaction.sign(
          inputIndex,
          privateKey,
          script,
          amount,
          hashType,
        )

        // Assert
        const expectedSignatureHex =
          '0176da08c70dd993c7d21f68e923f0f2585ca51a765b3a12f184176cc4277583bf544919a8c36ca9bd5d25d6b4b2a4ab6f303937725c134df86db82d78f627c7c3' // your expected signature in hex
        expect(Buffer.from(signature.toU8Vec()).toString('hex')).toEqual(
          expectedSignatureHex,
        )
      })
    })

    it('should verify a deterministic signature', () => {
      // Arrange
      const inputIndex = 0
      const privateKey = new Uint8Array(
        Buffer.from(
          '7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad',
          'hex',
        ),
      )
      const script = new Uint8Array([])
      const amount = BigInt(100)
      const hashType = TransactionSignature.SIGHASH_ALL
      const inputs: TransactionInput[] = [
        new TransactionInput(
          Buffer.alloc(32),
          0,
          Script.fromString(''),
          0xffffffff,
        ),
      ]
      // expect tx output to equal hext
      expect(inputs[0].toBuffer().toString('hex')).toEqual(
        '00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff',
      )
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), Script.fromString('')),
      ]
      expect(outputs[0].toBuffer().toString('hex')).toEqual(
        '000000000000006400',
      )
      const transaction = new Transaction(1, inputs, outputs, BigInt(0))
      expect(transaction.toBuffer().toString('hex')).toEqual(
        '010100000000000000000000000000000000000000000000000000000000000000000000000000ffffffff010000000000000064000000000000000000',
      )

      // Act
      const signature = transaction.sign(
        inputIndex,
        privateKey,
        script,
        amount,
        hashType,
      )

      // Assert
      const expectedSignatureHex =
        '0176da08c70dd993c7d21f68e923f0f2585ca51a765b3a12f184176cc4277583bf544919a8c36ca9bd5d25d6b4b2a4ab6f303937725c134df86db82d78f627c7c3' // your expected signature in hex
      expect(Buffer.from(signature.toU8Vec()).toString('hex')).toEqual(
        expectedSignatureHex,
      )
      const publicKey = new Key(privateKey).publicKey
      const result = transaction.verify(
        inputIndex,
        publicKey,
        signature,
        script,
        amount,
      )
      expect(result).toBe(true)
    })
  })
})
