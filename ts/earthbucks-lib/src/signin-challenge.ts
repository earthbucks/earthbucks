import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { PermissionToken } from "./permission-token.js";
import { SignedMessage } from "./signed-message.js";
import { SysBuf, EbxBuf } from "./buf.js";

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
    const message = permissionToken.toBuf();
    const signedMessage = SignedMessage.fromSignMessage(
      domainPrivKey,
      message,
      signInPermissionStr,
    );
    return new SigninChallenge(signedMessage);
  }

  static fromBuf(buf: SysBuf, domain: string): SigninChallenge {
    const signinChallengeKeyStr =
      SigninChallenge.signinChallengeKeyString(domain);
    const signedMessage = SignedMessage.fromBuf(buf, signinChallengeKeyStr);
    return new SigninChallenge(signedMessage);
  }

  static fromStrictHex(hex: string, domain: string): SigninChallenge {
    // TODO: Fix return type (do not throw error)
    const buf = EbxBuf.fromStrictHex(hex.length / 2, hex);
    return SigninChallenge.fromBuf(buf.buf, domain);
  }

  toBuf(): SysBuf {
    return this.signedMessage.toBuf();
  }

  toStrictHex(): string {
    return this.toBuf().toString("hex");
  }

  isValid(domainPubKey: PubKey, domain: string): boolean {
    const message = this.signedMessage.message;
    const permissionToken = PermissionToken.fromBuf(message);
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
