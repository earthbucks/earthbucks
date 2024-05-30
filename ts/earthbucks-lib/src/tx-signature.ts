import { EbxBuf } from "./ebx-buf";

export class TxSignature {
  static readonly SIGHASH_ALL = 0x00000001;
  static readonly SIGHASH_NONE = 0x00000002;
  static readonly SIGHASH_SINGLE = 0x00000003;
  static readonly SIGHASH_ANYONECANPAY = 0x00000080;
  static readonly SIZE = 65;

  hashType: number;
  sigBuf: EbxBuf;

  constructor(hashType: number, sigBuf: EbxBuf) {
    this.hashType = hashType;
    this.sigBuf = sigBuf;
  }

  toIsoBuf(): EbxBuf {
    const hashTypeBuf = EbxBuf.alloc(1);
    hashTypeBuf.writeUInt8(this.hashType);
    return EbxBuf.concat([hashTypeBuf, this.sigBuf]);
  }

  static fromIsoBuf(buf: EbxBuf): TxSignature {
    const hashType = buf[0];
    const sigBuf = buf.subarray(1);
    return new TxSignature(hashType, sigBuf);
  }
}
