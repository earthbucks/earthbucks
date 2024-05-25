import PrivKey from "./priv-key";
import PubKey from "./pub-key";
import IsoHex from "./iso-hex";
import SignedMessage from "./signed-message";
import SigninChallenge from "./signin-challenge";

export default class SigninResponse {
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
