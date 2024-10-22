import { EbxBuf } from "./buf.js";
import { SignedMessage } from "./signed-message.js";
import type { PrivKey } from "./priv-key.js";
import type { PubKey } from "./pub-key.js";
import type { WebBuf } from "./buf.js";
import type { SigninChallenge } from "./signin-challenge.js";

export class SigninResponse {
  signedMessage: SignedMessage;

  constructor(signedMessage: SignedMessage) {
    this.signedMessage = signedMessage;
  }

  static signinResponseKeyString(domain: string): string {
    return `signin response for ${domain}`;
  }

  static fromSigninChallenge(
    userPrivKey: PrivKey,
    domain: string,
    domainPubKey: PubKey,
    signinChallenge: SigninChallenge,
  ): SigninResponse {
    const isSignedChallengeValid = signinChallenge.isValid(
      domainPubKey,
      domain,
    );
    if (!isSignedChallengeValid) {
      throw new Error("Invalid signin challenge");
    }
    const signInResponseStr = SigninResponse.signinResponseKeyString(domain);
    const message = signinChallenge.toBuf();
    const signedMessage = SignedMessage.fromSignMessage(
      userPrivKey,
      message,
      signInResponseStr,
    );
    return new SigninResponse(signedMessage);
  }

  static fromBuf(buf: WebBuf, domain: string): SigninResponse {
    const signInResponseStr = SigninResponse.signinResponseKeyString(domain);
    const signedMessage = SignedMessage.fromBuf(buf, signInResponseStr);
    return new SigninResponse(signedMessage);
  }

  static fromHex(hex: string, domain: string): SigninResponse {
    const buf = EbxBuf.fromHex(hex.length / 2, hex);
    return SigninResponse.fromBuf(buf.buf, domain);
  }

  toBuf(): WebBuf {
    return this.signedMessage.toBuf();
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  isValid(userPubKey: PubKey, domain: string): boolean {
    const keyStr = SigninResponse.signinResponseKeyString(domain);
    return this.signedMessage.isValid(userPubKey, keyStr);
  }
}
