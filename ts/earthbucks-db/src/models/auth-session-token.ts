import type { AuthSessionToken, NewAuthSessionToken } from "../schema-auth";
import { TableAuthSessionToken } from "../schema-auth";
import { db } from "../index";
import { SysBuf } from "earthbucks-lib/src/lib.js";
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
import { PubKey, Hash, FixedBuf } from "earthbucks-lib/src/lib.js";

export async function createAuthSessionToken(
  pubKey: PubKey,
  expiresAt: Date | undefined,
): Promise<string> {
  let sessionId = crypto.getRandomValues(FixedBuf.alloc(16));
  let tokenId: FixedBuf<16> = FixedBuf.fromBuf(16, Hash.blake3Hash(sessionId).subarray(0, 16));
  let now = Date.now(); // milliseconds
  let createdAt = new Date(now);
  expiresAt = expiresAt || new Date(now + 1000 * 60 * 60 * 24 * 365 * 2); // two years
  const newAuthSigninToken: NewAuthSessionToken = {
    id: tokenId,
    pubKey: pubKey.toBuf(),
    createdAt,
    expiresAt,
  };
  await db.insert(TableAuthSessionToken).values(newAuthSigninToken);
  return sessionId.toString("hex");
}

export async function getAuthSessionToken(
  sessionId: string,
): Promise<AuthSessionToken | null> {
  let sessionIdBuf = FixedBuf.fromStrictHex(32, sessionId);
  let tokenId = FixedBuf.fromBuf(16, Hash.blake3Hash(sessionIdBuf).subarray(0, 16));
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
  return authSigninToken || null;
}

export async function deleteAuthSessionToken(sessionId: string) {
  // TODO: Instead of deleting, we should mark the token as invalid
  let sessionIdBuf = SysBuf.from(sessionId, "hex");
  let tokenId = FixedBuf.fromBuf(16, Hash.blake3Hash(sessionIdBuf).subarray(0, 16));
  await db
    .delete(TableAuthSessionToken)
    .where(eq(TableAuthSessionToken.id, tokenId));
}
