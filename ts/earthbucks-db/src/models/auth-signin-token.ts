import type { AuthSigninToken, NewAuthSigninToken } from "../schema-auth";
import { TableAuthSigninToken } from "../schema-auth";
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

export async function createNewAuthSigninToken(): Promise<Buffer> {
  let id: Buffer = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
  // now plus 15 minutes
  let expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const newAuthSigninToken: NewAuthSigninToken = {
    id,
    expiresAt,
  };
  await db.insert(TableAuthSigninToken).values(newAuthSigninToken);
  return id;
}

export async function getAuthSigninToken(
  id: Buffer,
): Promise<AuthSigninToken | null> {
  const [authSigninToken] = await db
    .select()
    .from(TableAuthSigninToken)
    .where(eq(TableAuthSigninToken.id, id))
    .limit(1);
  return authSigninToken;
}
