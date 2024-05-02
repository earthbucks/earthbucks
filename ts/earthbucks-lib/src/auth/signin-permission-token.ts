import PrivKey from "../priv-key";
import PubKey from "../pub-key";
import StrictHex from "../strict-hex";
import PermissionToken from "./permission-token";
import SignedMessage from "./signed-message";

export default class SigninPermissionToken {
  signedMessage: SignedMessage;

  constructor(signedMessage: SignedMessage) {
    this.signedMessage = signedMessage;
  }

  static signinPermissionString(domain: string): string {
    return `signin permission token for ${domain}`;
  }

  static fromRandom(
    authPrivKey: PrivKey,
    domain: string,
  ): SigninPermissionToken {
    const signInPermissionStr =
      SigninPermissionToken.signinPermissionString(domain);
    const permissionToken = PermissionToken.fromRandom();
    const message = permissionToken.toBuffer();
    const signedMessage = SignedMessage.fromSignMessage(
      authPrivKey,
      message,
      signInPermissionStr,
    );
    return new SigninPermissionToken(signedMessage);
  }

  static fromBuffer(buf: Buffer, domain: string): SigninPermissionToken {
    const signInPermissionStr =
      SigninPermissionToken.signinPermissionString(domain);
    const signedMessage = SignedMessage.fromBuffer(buf, signInPermissionStr);
    return new SigninPermissionToken(signedMessage);
  }

  static fromHex(hex: string, domain: string): SigninPermissionToken {
    const buf = StrictHex.decode(hex);
    return SigninPermissionToken.fromBuffer(buf, domain);
  }

  toBuffer(): Buffer {
    return this.signedMessage.toBuffer();
  }

  toHex(): string {
    return this.toBuffer().toString("hex");
  }

  isValid(authPubKey: PubKey): boolean {
    const message = this.signedMessage.message;
    const permissionToken = PermissionToken.fromBuffer(message);
    if (!permissionToken.isValid()) {
      return false;
    }
    return this.signedMessage.isValid(authPubKey);
  }
}
