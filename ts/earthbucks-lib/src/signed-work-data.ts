import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import type { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { SignedMessage } from "./signed-message.js";
import { WorkData } from "./work-data.js";

export class SignedWorkData {
  signedMessage: SignedMessage;

  constructor(signedMessage: SignedMessage) {
    this.signedMessage = signedMessage;
  }

  static signedWorkDataKeyString(domain: string): string {
    return `signed work data for ${domain}`;
  }

  static fromWorkData(
    domainPrivKey: PrivKey,
    domain: string,
    workData: WorkData,
  ): SignedWorkData {
    const signedWorkDataKeyStr = SignedWorkData.signedWorkDataKeyString(domain);
    const message = workData.toBuf();
    const signedMessage = SignedMessage.fromSignMessage(
      domainPrivKey,
      message,
      signedWorkDataKeyStr,
    );
    return new SignedWorkData(signedMessage);
  }

  toWorkData(): WorkData {
    return WorkData.fromBuf(this.signedMessage.message);
  }

  static fromBuf(buf: WebBuf, domain: string): SignedWorkData {
    const signedWorkDataKeyStr = SignedWorkData.signedWorkDataKeyString(domain);
    const signedMessage = SignedMessage.fromBuf(buf, signedWorkDataKeyStr);
    return new SignedWorkData(signedMessage);
  }

  static fromHex(hex: string, domain: string): SignedWorkData {
    const buf = FixedBuf.fromHex(hex.length / 2, hex);
    return SignedWorkData.fromBuf(buf.buf, domain);
  }

  toBuf(): WebBuf {
    return this.signedMessage.toBuf();
  }

  toHex(): string {
    return this.toBuf().toHex();
  }

  isValid(domainPubKey: PubKey, domain: string, now = new Date()): boolean {
    const message = this.signedMessage.message;
    let workData: WorkData;
    try {
      workData = WorkData.fromBuf(message);
    } catch (e) {
      return false;
    }
    if (workData.expiresAt.n < now.getTime()) {
      return false;
    }
    const keyStr = SignedWorkData.signedWorkDataKeyString(domain);
    if (!this.signedMessage.isValid(domainPubKey, keyStr)) {
      return false;
    }
    return true;
  }
}
