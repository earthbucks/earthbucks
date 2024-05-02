import PrivKey from "../priv-key";
import PubKey from "../pub-key";
import StrictHex from "../strict-hex";
import PermissionToken from "./permission-token";
import SignedMessage from "./signed-message";

export default class SigninChallenge {
  signedMessage: SignedMessage;

  constructor(signedMessage: SignedMessage) {
    this.signedMessage = signedMessage;
  }

  static signinChallengeKeyString(domain: string): string {
    return `signin challenge for ${domain}`;
  }

  static fromRandom(domainPrivKey: PrivKey, domain: string): SigninChallenge {
    const signInPermissionStr =
      SigninChallenge.signinChallengeKeyString(domain);
    const permissionToken = PermissionToken.fromRandom();
    const message = permissionToken.toBuffer();
    const signedMessage = SignedMessage.fromSignMessage(
      domainPrivKey,
      message,
      signInPermissionStr,
    );
    return new SigninChallenge(signedMessage);
  }

  static fromBuffer(buf: Buffer, domain: string): SigninChallenge {
    const signinChallengeKeyStr =
      SigninChallenge.signinChallengeKeyString(domain);
    const signedMessage = SignedMessage.fromBuffer(buf, signinChallengeKeyStr);
    return new SigninChallenge(signedMessage);
  }

  static fromHex(hex: string, domain: string): SigninChallenge {
    const buf = StrictHex.decode(hex);
    return SigninChallenge.fromBuffer(buf, domain);
  }

  toBuffer(): Buffer {
    return this.signedMessage.toBuffer();
  }

  toHex(): string {
    return this.toBuffer().toString("hex");
  }

  isValid(domainPubKey: PubKey, domain: string): boolean {
    const message = this.signedMessage.message;
    const permissionToken = PermissionToken.fromBuffer(message);
    if (!permissionToken.isValid()) {
      return false;
    }
    const keyStr = SigninChallenge.signinChallengeKeyString(domain);
    if (!this.signedMessage.isValid(domainPubKey, keyStr)) {
      return false;
    }
    return true;
  }
}
