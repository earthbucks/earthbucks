import { IsoBuf } from "./iso-buf";

export class TxSignature {
  static readonly SIGHASH_ALL = 0x00000001;
  static readonly SIGHASH_NONE = 0x00000002;
  static readonly SIGHASH_SINGLE = 0x00000003;
  static readonly SIGHASH_ANYONECANPAY = 0x00000080;
  static readonly SIZE = 65;

  hashType: number;
  sigBuf: IsoBuf;

  constructor(hashType: number, sigBuf: IsoBuf) {
    this.hashType = hashType;
    this.sigBuf = sigBuf;
  }

  toIsoBuf(): IsoBuf {
    const hashTypeBuf = IsoBuf.alloc(1);
    hashTypeBuf.writeUInt8(this.hashType);
    return IsoBuf.concat([hashTypeBuf, this.sigBuf]);
  }

  static fromIsoBuf(buf: IsoBuf): TxSignature {
    const hashType = buf[0];
    const sigBuf = buf.subarray(1);
    return new TxSignature(hashType, sigBuf);
  }
}
