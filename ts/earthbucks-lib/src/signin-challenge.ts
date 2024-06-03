import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { PermissionToken } from "./permission-token.js";
import { SignedMessage } from "./signed-message.js";
import { SysBuf, IsoBuf } from "./iso-buf.js";

export class SigninChallenge {
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
    const message = permissionToken.toIsoBuf();
    const signedMessage = SignedMessage.fromSignMessage(
      domainPrivKey,
      message,
      signInPermissionStr,
    );
    return new SigninChallenge(signedMessage);
  }

  static fromIsoBuf(buf: SysBuf, domain: string): SigninChallenge {
    const signinChallengeKeyStr =
      SigninChallenge.signinChallengeKeyString(domain);
    const signedMessage = SignedMessage.fromIsoBuf(buf, signinChallengeKeyStr);
    return new SigninChallenge(signedMessage);
  }

  static fromIsoHex(hex: string, domain: string): SigninChallenge {
    // TODO: Fix return type (do not throw error)
    const buf = IsoBuf.fromStrictHex(hex.length / 2, hex);
    return SigninChallenge.fromIsoBuf(buf, domain);
  }

  toIsoBuf(): SysBuf {
    return this.signedMessage.toIsoBuf();
  }

  toIsoHex(): string {
    return this.toIsoBuf().toString("hex");
  }

  isValid(domainPubKey: PubKey, domain: string): boolean {
    const message = this.signedMessage.message;
    const permissionToken = PermissionToken.fromIsoBuf(message);
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
