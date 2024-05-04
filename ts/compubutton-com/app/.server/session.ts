import { SessionData, createSessionStorage } from "@remix-run/node"; // or cloudflare/deno
import { db } from "earthbucks-db/src/index";
import { DOMAIN } from "./config";
import { Buffer } from "buffer";
import {
  createAuthSessionToken,
  deleteAuthSessionToken,
  getAuthSessionToken,
  updateAuthSessionToken,
} from "earthbucks-db/src/models/auth-session-token";
import PubKey from "earthbucks-lib/src/pub-key";

// cookie: {
//   name: '__session_user',
//   httpOnly: true,
//   path: '/',
//   sameSite: 'lax',
//   secrets: [process.env.SESSION_SECRET],
//   secure: process.env.NODE_ENV === 'production',
//   domain: process.env.NODE_ENV === 'production' ? DOMAIN : undefined,
//   maxAge: 60 * 60 * 24 * 365 * 2, // two years
// }

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
      // `expires` is a Date after which the data should be considered
      // invalid. You could use it to invalidate the data somehow or
      // automatically purge this record from your database.
      let pubKey: PubKey = data.pubKey;
      const id = await createAuthSessionToken(pubKey, expiresAt);
      return id;
    },
    async readData(id) {
      let res = await getAuthSessionToken(id);
      if (!res) return null;
      let pubKeyBuf = res.pubKey;
      let pubKey = PubKey.fromBuffer(pubKeyBuf);
      return {
        pubKey,
      };
    },
    async updateData(id, data, expires) {
      throw new Error("updateData not implemented");
      // await updateAuthSessionToken(id, expires);
      // return;
    },
    async deleteData(id) {
      await deleteAuthSessionToken(id);
    },
  });
}

const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage();

export { getSession, commitSession, destroySession };
