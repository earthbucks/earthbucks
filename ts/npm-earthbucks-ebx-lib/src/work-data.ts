import { BufReader } from "@webbuf/rw";
import { BufWriter } from "@webbuf/rw";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { Header } from "./header.js";
import { U256BE, U64BE, U8 } from "@webbuf/numbers";
import { MerkleProof } from "./merkle-proof.js";
import { Tx } from "./tx.js";

const FORTY_SECONDS_MS = 40 * 1000;

export class WorkData {
  header: Header;
  shareDifficulty: U64BE;
  mintTx: Tx;
  prevMerkleRootId: FixedBuf<32> | null;
  newMerkleRootId: FixedBuf<32>;
  merkleProof: MerkleProof;
  shareTarget: U256BE;
  expiresAt: U64BE;

  constructor({
    header,
    shareDifficulty,
    mintTx,
    prevMerkleRootId,
    newMerkleRootId,
    merkleProof,
    shareTarget,
    expiresAt = new U64BE(new Date().getTime() + FORTY_SECONDS_MS),
  }: {
    header: Header;
    shareDifficulty: U64BE;
    mintTx: Tx;
    prevMerkleRootId: FixedBuf<32> | null;
    newMerkleRootId: FixedBuf<32>;
    merkleProof: MerkleProof;
    shareTarget: U256BE;
    expiresAt: U64BE;
  }) {
    this.header = header;
    this.shareDifficulty = shareDifficulty;
    this.mintTx = mintTx;
    this.prevMerkleRootId = prevMerkleRootId;
    this.newMerkleRootId = newMerkleRootId;
    this.merkleProof = merkleProof;
    this.shareTarget = shareTarget;
    this.expiresAt = expiresAt;
  }

  toBuf(): WebBuf {
    const bw = new BufWriter();
    bw.write(this.header.toBuf());
    bw.write(this.shareDifficulty.toBEBuf().buf);
    const mintTxBuf = this.mintTx.toBuf();
    const mintTxLen = new U64BE(mintTxBuf.length);
    bw.write(mintTxLen.toBEBuf().buf);
    bw.write(mintTxBuf);
    if (this.prevMerkleRootId) {
      bw.writeU8(new U8(1));
      bw.write(this.prevMerkleRootId.buf);
    } else {
      bw.writeU8(new U8(0));
    }
    bw.write(this.newMerkleRootId.buf);
    const merkleProofBuf = this.merkleProof.toBuf();
    const merkleProofLen = new U64BE(merkleProofBuf.length);
    bw.write(merkleProofLen.toBEBuf().buf);
    bw.write(merkleProofBuf);
    bw.write(this.shareTarget.toBEBuf().buf);
    bw.write(this.expiresAt.toBEBuf().buf);
    return bw.toBuf();
  }

  static fromBuf(buf: WebBuf): WorkData {
    const br = new BufReader(buf);
    const header = Header.fromBuf(br.readFixed(217).buf);
    const shareDifficulty = br.readU64BE();
    const mintTxLen = br.readU64BE();
    const mintTx = Tx.fromBuf(br.read(mintTxLen.n));
    const prevMerkleRootIdFlag = br.readU8();
    const prevMerkleRootId =
      prevMerkleRootIdFlag.n === 1 ? br.readFixed(32) : null;
    const newMerkleRootId = br.readFixed(32);
    const merkleProofLen = br.readU64BE();
    const merkleProofBuf = br.read(merkleProofLen.n);
    const merkleProof = MerkleProof.fromBuf(merkleProofBuf);
    const shareTarget = br.readU256BE();
    const expiresAt = br.readU64BE();
    return new WorkData({
      header,
      shareDifficulty,
      mintTx,
      prevMerkleRootId,
      newMerkleRootId,
      merkleProof,
      shareTarget,
      expiresAt,
    });
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromHex(hex: string): WorkData {
    const buf = FixedBuf.fromHex(hex.length / 2, hex);
    return WorkData.fromBuf(buf.buf);
  }
}
