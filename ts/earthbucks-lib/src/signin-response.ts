import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { SignedMessage } from "./signed-message.js";
import { SigninChallenge } from "./signin-challenge.js";
import { SysBuf, EbxBuf } from "./buf.js";

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
    const signInResponseStr = SigninResponse.signinResponseKeyString(domain);
    const message = signinChallenge.toBuf();
    const signedMessage = SignedMessage.fromSignMessage(
      userPrivKey,
      message,
      signInResponseStr,
    );
    return new SigninResponse(signedMessage);
  }

  static toBuf(buf: SysBuf, domain: string): SigninResponse {
    const signInResponseStr = SigninResponse.signinResponseKeyString(domain);
    const signedMessage = SignedMessage.fromBuf(buf, signInResponseStr);
    return new SigninResponse(signedMessage);
  }

  static fromStrictHex(hex: string, domain: string): SigninResponse {
    const buf = EbxBuf.fromStrictHex(hex.length / 2, hex);
    return SigninResponse.toBuf(buf, domain);
  }

  toBuf(): SysBuf {
    return this.signedMessage.toBuf();
  }

  toStrictHex(): string {
    return this.toBuf().toString("hex");
  }

  isValid(userPubKey: PubKey, domain: string): boolean {
    const keyStr = SigninResponse.signinResponseKeyString(domain);
    return this.signedMessage.isValid(userPubKey, keyStr);
  }
}
