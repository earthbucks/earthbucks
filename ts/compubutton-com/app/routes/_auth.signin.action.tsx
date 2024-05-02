import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, json, useFetcher } from "@remix-run/react";
import {
  createNewAuthSigninToken,
  getAuthSigninToken,
} from "earthbucks-db/src/models/auth-signin-token";
import PrivKey from "earthbucks-lib/src/priv-key";
import PubKey from "earthbucks-lib/src/pub-key";
import SignedMessage from "earthbucks-lib/src/signed-message";
import BufferReader from "earthbucks-lib/src/buffer-reader";
import BufferWriter from "earthbucks-lib/src/buffer-writer";
import Domain from 'earthbucks-lib/src/domain'
import StrictHex from "earthbucks-lib/src/strict-hex";

const AUTH_PERMISSION_PRIV_KEY_STR: string = process.env.AUTH_PERMISSION_PRIV_KEY || "";
const AUTH_DOMAIN_NAME: string = process.env.AUTH_DOMAIN_NAME || "";

let AUTH_PRIV_KEY: PrivKey;
let AUTH_PUB_KEY: PubKey;
try {
  AUTH_PRIV_KEY = PrivKey.fromStringFmt(AUTH_PERMISSION_PRIV_KEY_STR);
  AUTH_PUB_KEY = PubKey.fromPrivKey(AUTH_PRIV_KEY);
} catch (err) {
  console.error(err);
  throw new Error("Invalid AUTH_PERMISSION_PRIV_KEY");
}

{
  let domainIsValid = Domain.isValidDomain(AUTH_DOMAIN_NAME);
  if (!domainIsValid) {
    throw new Error("Invalid AUTH_DOMAIN_NAME");
  }
}

class PermissionToken {
  randValue: Buffer
  timestamp: bigint // milliseconds

  constructor(randValue: Buffer, timestamp: bigint) {
    this.randValue = randValue;
    this.timestamp = timestamp; // milliseconds
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter();
    writer.writeBuffer(this.randValue);
    writer.writeUInt64BEBigInt(this.timestamp);
    return writer.toBuffer();
  }

  static fromBuffer(buf: Buffer): PermissionToken {
    const reader = new BufferReader(buf);
    const randValue = reader.readBuffer(32);
    const timestamp = reader.readUInt64BEBigInt();
    return new PermissionToken(randValue, timestamp);
  }

  static fromRandom(): PermissionToken {
    const randValue = crypto.getRandomValues(new Uint8Array(32));
    const timestamp = BigInt(Date.now()); // milliseconds
    return new PermissionToken(Buffer.from(randValue), timestamp);
  }

  isValid(): boolean {
    return Date.now() - Number(this.timestamp) < 15 * 60 * 1000; // 15 minutes
  }
}

class SigninPermissionToken {
  signedMessage: SignedMessage;

  constructor(signedMessage: SignedMessage) {
    this.signedMessage = signedMessage;
  }

  static signinPermissionString(domain: string): string {
    return `sign in permission token for ${domain}`;
  }

  static fromRandom(authPrivKey: PrivKey, domain: string): SigninPermissionToken {
    const signInPermissionStr = SigninPermissionToken.signinPermissionString(domain);
    const permissionToken = PermissionToken.fromRandom();
    const message = permissionToken.toBuffer();
    const signedMessage = SignedMessage.fromSignMessage(authPrivKey, message, signInPermissionStr);
    return new SigninPermissionToken(signedMessage);
  }

  static fromBuffer(buf: Buffer, domain: string): SigninPermissionToken {
    const signInPermissionStr = SigninPermissionToken.signinPermissionString(domain);
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

  isValid(): boolean {
    const message = this.signedMessage.message;
    const permissionToken = PermissionToken.fromBuffer(message);
    if (!permissionToken.isValid()) {
      return false;
    }
    return this.signedMessage.isValid(AUTH_PUB_KEY);
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = `${formData.get("method")}`;
  if (method === "new-permission-token") {
    const signedPermissionToken = SigninPermissionToken.fromRandom(AUTH_PRIV_KEY, AUTH_DOMAIN_NAME);
    return json({ signedPermissionToken: signedPermissionToken.toHex() });
  } else if (method === "new-auth-signin-token") {
    const tokenId = await createNewAuthSigninToken();
    console.log(tokenId.toString("hex"));
    const token = await getAuthSigninToken(tokenId);
    console.log(token?.id.toString("hex"));
    console.log(token);
    return json({ tokenId: tokenId.toString("hex") });
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
}
