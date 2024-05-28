import { PrivKey } from "./priv-key.ts";
import { PubKey } from "./pub-key.ts";
import { IsoHex } from "./iso-hex.ts";
import { SignedMessage } from "./signed-message.ts";
import { SigninChallenge } from "./signin-challenge.ts";

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

  static toIsoBuf(buf: Buffer, domain: string): SigninResponse {
    const signInResponseStr = SigninResponse.signinResponseKeyString(domain);
    const signedMessage = SignedMessage.fromIsoBuf(buf, signInResponseStr);
    return new SigninResponse(signedMessage);
  }

  static fromIsoHex(hex: string, domain: string): SigninResponse {
    const buf = IsoHex.decode(hex).unwrap();
    return SigninResponse.toIsoBuf(buf, domain);
  }

  toIsoBuf(): Buffer {
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
