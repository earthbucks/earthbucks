import type { AuthSessionToken, NewAuthSessionToken } from "../schema-auth";
import { TableAuthSessionToken } from "../schema-auth";
import { db } from "../index";
import { Buffer } from "buffer";
import {
  eq,
  lt,
  gt,
  gte,
  ne,
  and,
  or,
  asc,
  desc,
  sql,
  max,
  Table,
} from "drizzle-orm";
import PubKey from "earthbucks-lib/src/pub-key";
import { blake3Hash } from "earthbucks-lib/src/blake3";

export async function createNewAuthSessionToken(
  pubKey: PubKey,
): Promise<Buffer> {
  let sessionId = crypto.getRandomValues(Buffer.alloc(32));
  let tokenId: Buffer = blake3Hash(sessionId);
  let now = Date.now(); // milliseconds
  let createdAt = new Date(now);
  let expiresAt = new Date(now + 15 * 60 * 1000); // now plus 15 minutes
  const newAuthSigninToken: NewAuthSessionToken = {
    id: tokenId,
    pubKey: pubKey.toBuffer(),
    createdAt,
    expiresAt,
  };
  await db.insert(TableAuthSessionToken).values(newAuthSigninToken);
  return sessionId;
}

export async function getAuthSessionToken(
  sessionId: Buffer,
): Promise<AuthSessionToken | null> {
  let tokenId: Buffer = blake3Hash(sessionId);
  const [authSigninToken] = await db
    .select()
    .from(TableAuthSessionToken)
    .where(eq(TableAuthSessionToken.id, tokenId))
    .limit(1);
  return authSigninToken;
}
