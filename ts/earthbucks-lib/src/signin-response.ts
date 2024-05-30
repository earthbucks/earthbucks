import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { IsoHex } from "./iso-hex.js";
import { SignedMessage } from "./signed-message.js";
import { SigninChallenge } from "./signin-challenge.js";
import { EbxBuffer } from "./ebx-buffer.js";

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
    const message = signinChallenge.toIsoBuf();
    const signedMessage = SignedMessage.fromSignMessage(
      userPrivKey,
      message,
      signInResponseStr,
    );
    return new SigninResponse(signedMessage);
  }

  static toIsoBuf(buf: EbxBuffer, domain: string): SigninResponse {
    const signInResponseStr = SigninResponse.signinResponseKeyString(domain);
    const signedMessage = SignedMessage.fromIsoBuf(buf, signInResponseStr);
    return new SigninResponse(signedMessage);
  }

  static fromIsoHex(hex: string, domain: string): SigninResponse {
    const buf = IsoHex.decode(hex).unwrap();
    return SigninResponse.toIsoBuf(buf, domain);
  }

  toIsoBuf(): EbxBuffer {
    return this.signedMessage.toIsoBuf();
  }

  toIsoHex(): string {
    return this.toIsoBuf().toString("hex");
  }

  isValid(userPubKey: PubKey, domain: string): boolean {
    const keyStr = SigninResponse.signinResponseKeyString(domain);
    return this.signedMessage.isValid(userPubKey, keyStr);
  }
}
