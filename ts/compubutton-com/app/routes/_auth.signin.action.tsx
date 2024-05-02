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

const AUTH_PERMISSION_PRIV_KEY: string = process.env.AUTH_PERMISSION_PRIV_KEY || "";

let authPrivKey: PrivKey;
let authPubKey: PubKey;
try {
  authPrivKey = PrivKey.fromStringFmt(AUTH_PERMISSION_PRIV_KEY);
  authPubKey = PubKey.fromPrivKey(authPrivKey);
} catch (err) {
  console.error(err);
  throw new Error("Invalid AUTH_PERMISSION_PRIV_KEY");
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

class SignedPermissionToken {
  signedMessage: SignedMessage;

  constructor(signedMessage: SignedMessage) {
    this.signedMessage = signedMessage;
  }

  static fromRandom(): SignedPermissionToken {
    const permissionToken = PermissionToken.fromRandom();
    const message = permissionToken.toBuffer();
    const signedMessage = SignedMessage.fromSignMessage(authPrivKey, message);
    return new SignedPermissionToken(signedMessage);
  }

  static fromBuffer(buf: Buffer): SignedPermissionToken {
    const signedMessage = SignedMessage.fromBuffer(buf);
    return new SignedPermissionToken(signedMessage);
  }

  toBuffer(): Buffer {
    return this.signedMessage.toBuffer();
  }

  isValid(): boolean {
    let message = this.signedMessage.message;
    let permissionToken = PermissionToken.fromBuffer(message);
    if (!permissionToken.isValid()) {
      return false;
    }
    return this.signedMessage.isValid(authPubKey);
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = `${formData.get("method")}`;
  if (method === "new-permission-token") {
    let signedPermissionToken = SignedPermissionToken.fromRandom();
    return json({ signedPermissionToken: signedPermissionToken.toBuffer().toString("hex") });
  } else if (method === "new-auth-signin-token") {
    let tokenId = await createNewAuthSigninToken();
    console.log(tokenId.toString("hex"));
    let token = await getAuthSigninToken(tokenId);
    console.log(token?.id.toString("hex"));
    console.log(token);
    return json({ tokenId: tokenId.toString("hex") });
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
}
