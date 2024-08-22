import { U256 } from "./numbers.js";
import { FixedBuf } from "./buf.js";
import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { Hash } from "./hash.js";
import type { U128 } from "./numbers.js";

const SIZE = 32;
type SIZE = 32;

export class CompuchaChallenge {
  challengeId: FixedBuf<16>;
  nonce: U128;

  constructor(challengeId: FixedBuf<16>, nonce: U128) {
    this.challengeId = challengeId;
    this.nonce = nonce;
  }

  static fromRandomNonce(challengeId: FixedBuf<16>): CompuchaChallenge {
    const nonceBuf = FixedBuf.fromRandom(32);
    const nonce = new BufReader(nonceBuf.buf).readU128BE();
    return new CompuchaChallenge(challengeId, nonce);
  }

  static fromBufReader(br: BufReader): CompuchaChallenge {
    const challengeId = br.readFixed(16);
    const nonce = br.readU128BE();
    return new CompuchaChallenge(challengeId, nonce);
  }

  static fromBuf(buf: FixedBuf<SIZE>): CompuchaChallenge {
    return CompuchaChallenge.fromBufReader(new BufReader(buf.buf));
  }

  toBuf(): FixedBuf<SIZE> {
    const bw = new BufWriter();
    bw.write(this.challengeId.buf);
    bw.writeU128BE(this.nonce);
    const sysBuf = bw.toBuf();
    const fixedBuf = new FixedBuf<SIZE>(SIZE, sysBuf);
    return fixedBuf;
  }

  static fromHex(hex: string): CompuchaChallenge {
    return CompuchaChallenge.fromBuf(FixedBuf.fromHex(SIZE, hex));
  }

  toHex(): string {
    return this.toBuf().toHex();
  }

  id(): FixedBuf<32> {
    const fixedBuf = this.toBuf();
    const hash = Hash.doubleBlake3Hash(fixedBuf.buf);
    return hash;
  }

  isTargetValid(targetNonce: U256): boolean {
    const hashBuf = this.id();
    const hashNum = U256.fromBEBuf(hashBuf.buf);
    return hashNum.bn < targetNonce.bn;
  }
}
