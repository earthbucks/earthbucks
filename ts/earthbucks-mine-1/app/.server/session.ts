import { SessionData, createSessionStorage } from "@remix-run/node"; // or cloudflare/deno
import { db } from "earthbucks-db/src/index";
import { DOMAIN } from "./config";
import { Buffer } from "buffer";
import {
  createAuthSessionToken,
  deleteAuthSessionToken,
  getAuthSessionToken,
} from "earthbucks-db/src/models/auth-session-token";
import PubKey from "earthbucks-lib/src/pub-key";

function createDatabaseSessionStorage() {
  let cookie = {
    name: "__session",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.NODE_ENV === "production" ? DOMAIN : undefined,
    maxAge: 60 * 60 * 24 * 365 * 2, // two years
  };

  return createSessionStorage({
    cookie,
    async createData(data, expiresAt): Promise<string> {
      let pubKey: PubKey = data.pubKey;
      const id = await createAuthSessionToken(pubKey, expiresAt);
      return id;
    },
    async readData(id) {
      let res = await getAuthSessionToken(id);
      if (!res) return null;
      let pubKeyBuf = res.pubKey;
      let pubKey = PubKey.fromIsoBuf(pubKeyBuf).unwrap();
      return {
        pubKey,
      };
    },
    async updateData(id, data, expires) {
      throw new Error("updateData not implemented");
    },
    async deleteData(id) {
      await deleteAuthSessionToken(id);
    },
  });
}

const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage();

export { getSession, commitSession, destroySession };

export async function getUserPubKey(request: Request): Promise<PubKey | null> {
  let session = await getSession(request.headers.get("Cookie"));
  return session.get("pubKey") || null;
}
