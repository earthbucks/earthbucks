import { FixedBuf } from "./buf.js";
import { U8 } from "./numbers.js";
import { Hash } from "./hash.js";
import { WebBuf } from "./buf.js";
import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { EbxBuf } from "./buf.js";
import type { U64 } from "./numbers.js";

const SIZE = 1 + 32 + 32 + 8;

export class BlockMessageHeader {
  version: U8;
  prevBlockMessageHeaderId: FixedBuf<32>;
  messageId: FixedBuf<32>;
  messageNum: U64;

  constructor(
    version: U8,
    prevBlockMessagePowId: FixedBuf<32>,
    messageId: FixedBuf<32>,
    messageNum: U64,
  ) {
    this.version = version;
    this.prevBlockMessageHeaderId = prevBlockMessagePowId;
    this.messageId = messageId;
    this.messageNum = messageNum;
  }

  static getMessageHash(message: string): FixedBuf<32> {
    const messageBuf = WebBuf.from(message);
    const messageHash = Hash.blake3Hash(messageBuf);
    return messageHash;
  }

  static getMessageId(message: string): FixedBuf<32> {
    const messageBuf = WebBuf.from(message);
    const messageHash = Hash.blake3Hash(messageBuf);
    const messageId = Hash.blake3Hash(messageHash.buf);
    return messageId;
  }

  static fromMessage(
    prevBlockMessageHeaderId: FixedBuf<32> | null,
    message: string,
    messageNum: U64,
  ): BlockMessageHeader {
    const messageId = BlockMessageHeader.getMessageId(message);
    return new BlockMessageHeader(
      new U8(0),
      prevBlockMessageHeaderId || FixedBuf.alloc(32),
      messageId,
      messageNum,
    );
  }

  toBufWriter(bw: BufWriter): BufWriter {
    bw.writeU8(this.version);
    bw.write(this.prevBlockMessageHeaderId.buf);
    bw.write(this.messageId.buf);
    bw.writeU64BE(this.messageNum);
    return bw;
  }

  static fromBufReader(br: BufReader): BlockMessageHeader {
    const version = br.readU8();
    const prevBlockMessageHeaderId = br.readFixed(32);
    const messageId = br.readFixed(32);
    const messageNum = br.readU64BE();
    return new BlockMessageHeader(
      version,
      prevBlockMessageHeaderId,
      messageId,
      messageNum,
    );
  }

  toBuf(): WebBuf {
    return this.toBufWriter(new BufWriter()).toBuf();
  }

  static fromBuf(buf: WebBuf): BlockMessageHeader {
    return BlockMessageHeader.fromBufReader(new BufReader(buf));
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromHex(hex: string): BlockMessageHeader {
    return BlockMessageHeader.fromBuf(EbxBuf.fromHex(SIZE, hex).buf);
  }

  hash(): FixedBuf<32> {
    return Hash.blake3Hash(this.toBuf());
  }

  id(): FixedBuf<32> {
    return Hash.blake3Hash(this.hash().buf);
  }

  verify(
    prevId: FixedBuf<32> | null,
    prevNum: U64 | null,
    message: string,
  ): boolean {
    const expectedVersion = new U8(0);
    if (this.version.n !== expectedVersion.n) {
      return false;
    }
    const expectedMessageId = BlockMessageHeader.getMessageId(message).buf;
    if (!expectedMessageId.equals(this.messageId.buf)) {
      return false;
    }
    if (prevId === null && prevNum !== null) {
      return false;
    }
    if (prevId !== null && prevNum === null) {
      return false;
    }
    if (prevId && prevNum !== null) {
      const expectedPrevId = prevId.buf;
      if (!expectedPrevId.equals(this.prevBlockMessageHeaderId.buf)) {
        return false;
      }
      const expectedPrevNum = prevNum.n + 1;
      if (this.messageNum.n !== expectedPrevNum) {
        return false;
      }
    }
    return true;
  }
}
