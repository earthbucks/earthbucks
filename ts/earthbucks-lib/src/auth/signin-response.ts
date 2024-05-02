import PrivKey from "../priv-key";
import PubKey from "../pub-key";
import StrictHex from "../strict-hex";
import PermissionToken from "./permission-token";
import SignedMessage from "./signed-message";
import SigninChallenge from "./signin-challenge";

export default class SigninReponse {
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
  ): SigninReponse {
    const isSignedChallengeValid = signinChallenge.isValid(domainPubKey, domain);
    const signInResponseStr = SigninReponse.signinResponseKeyString(domain);
    const message = signinChallenge.toBuffer();
    const signedMessage = SignedMessage.fromSignMessage(
      userPrivKey,
      message,
      signInResponseStr,
    );
    return new SigninReponse(signedMessage);
  }

  static fromBuffer(buf: Buffer, domain: string): SigninReponse {
    const signInResponseStr = SigninReponse.signinResponseKeyString(domain);
    const signedMessage = SignedMessage.fromBuffer(buf, signInResponseStr);
    return new SigninReponse(signedMessage);
  }

  static fromHex(hex: string, domain: string): SigninReponse {
    const buf = StrictHex.decode(hex);
    return SigninReponse.fromBuffer(buf, domain);
  }

  toBuffer(): Buffer {
    return this.signedMessage.toBuffer();
  }

  toHex(): string {
    return this.toBuffer().toString("hex");
  }

  isValid(userPubKey: PubKey, domain: string): boolean {
    const keyStr = SigninReponse.signinResponseKeyString(domain);
    return this.signedMessage.isValid(userPubKey, keyStr);
  }
}
