import { EbxBuffer } from "./ebx-buffer";

export class TxSignature {
  static readonly SIGHASH_ALL = 0x00000001;
  static readonly SIGHASH_NONE = 0x00000002;
  static readonly SIGHASH_SINGLE = 0x00000003;
  static readonly SIGHASH_ANYONECANPAY = 0x00000080;
  static readonly SIZE = 65;

  hashType: number;
  sigBuf: EbxBuffer;

  constructor(hashType: number, sigBuf: EbxBuffer) {
    this.hashType = hashType;
    this.sigBuf = sigBuf;
  }

  toIsoBuf(): EbxBuffer {
    const hashTypeBuf = EbxBuffer.alloc(1);
    hashTypeBuf.writeUInt8(this.hashType);
    return EbxBuffer.concat([hashTypeBuf, this.sigBuf]);
  }

  static fromIsoBuf(buf: EbxBuffer): TxSignature {
    const hashType = buf[0];
    const sigBuf = buf.subarray(1);
    return new TxSignature(hashType, sigBuf);
  }
}
