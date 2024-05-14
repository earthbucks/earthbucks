import { Buffer } from "buffer";

export default class TxSignature {
  static readonly SIGHASH_ALL = 0x00000001;
  static readonly SIGHASH_NONE = 0x00000002;
  static readonly SIGHASH_SINGLE = 0x00000003;
  static readonly SIGHASH_ANYONECANPAY = 0x00000080;
  static readonly SIZE = 65;

  hashType: number;
  sigBuf: Buffer;

  constructor(hashType: number, sigBuf: Buffer) {
    this.hashType = hashType;
    this.sigBuf = sigBuf;
  }

  toIsoBuf(): Buffer {
    const hashTypeBuf = Buffer.alloc(1);
    hashTypeBuf.writeUInt8(this.hashType);
    return Buffer.concat([hashTypeBuf, this.sigBuf]);
  }

  static fromIsoBuf(buf: Buffer): TxSignature {
    const hashType = buf[0];
    const sigBuf = buf.subarray(1);
    return new TxSignature(hashType, sigBuf);
  }
}
