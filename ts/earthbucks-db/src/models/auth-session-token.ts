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

export async function createAuthSessionToken(
  pubKey: PubKey,
  expiresAt: Date | undefined,
): Promise<string> {
  let sessionId = crypto.getRandomValues(Buffer.alloc(32));
  let tokenId: Buffer = blake3Hash(sessionId);
  let now = Date.now(); // milliseconds
  let createdAt = new Date(now);
  expiresAt = expiresAt || new Date(now + 1000 * 60 * 60 * 24 * 365 * 2); // two years
  const newAuthSigninToken: NewAuthSessionToken = {
    id: tokenId,
    pubKey: pubKey.toBuffer(),
    createdAt,
    expiresAt,
  };
  await db.insert(TableAuthSessionToken).values(newAuthSigninToken);
  return sessionId.toString("hex");
}

export async function getAuthSessionToken(
  sessionId: string,
): Promise<AuthSessionToken | null> {
  let sessionIdBuf = Buffer.from(sessionId, "hex");
  let tokenId: Buffer = blake3Hash(sessionIdBuf);
  const [authSigninToken] = await db
    .select()
    .from(TableAuthSessionToken)
    .where(
      and(
        eq(TableAuthSessionToken.id, tokenId),
        gt(TableAuthSessionToken.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return authSigninToken;
}

export async function deleteAuthSessionToken(sessionId: string) {
  let sessionIdBuf = Buffer.from(sessionId, "hex");
  let tokenId: Buffer = blake3Hash(sessionIdBuf);
  await db.delete(TableAuthSessionToken).where(eq(TableAuthSessionToken.id, tokenId));
}