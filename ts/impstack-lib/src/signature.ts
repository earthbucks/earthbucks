export default class Signature {
  static readonly SIGHASH_ALL = 0x00000001;
  static readonly SIGHASH_NONE = 0x00000002;
  static readonly SIGHASH_SINGLE = 0x00000003;
  static readonly SIGHASH_ANYONECANPAY = 0x00000080;

  hashType: number
  sigBuf: Uint8Array

  constructor(hashType: number, sigBuf: Uint8Array) {
    this.hashType = hashType
    this.sigBuf = sigBuf
  }
}