import {
  mysqlTable,
  mysqlSchema,
  AnyMySqlColumn,
  primaryKey,
  bigint,
  text,
  longtext,
  timestamp,
  tinyint,
  char,
  varchar,
  datetime,
  unique,
  int,
  binary,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const AuthSigninToken = mysqlTable(
  "auth_signin_token",
  {
    // id
    id: binary("id", { length: 32 }).notNull(),
    // database metadata
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    usedAt: datetime("used_at", { mode: "string" }),
    pubKey: binary("pub_key", { length: 33 }),
    sig: binary("sig", { length: 65 }),
    mac: binary("mac", { length: 32 }),
    ipAddress: varchar("ip_address", { length: 255 }),
    expiresAt: datetime("expires_at", { mode: "string" }).notNull(),
  },
  (table) => {
    return {
      appSigninTokenId: primaryKey({
        columns: [table.id],
        name: "auth_signin_token_id",
      }),
    };
  },
);

export const AuthPubKeys = mysqlTable(
  "auth_pub_keys",
  {
    // id
    id: binary("id", { length: 33 }).notNull(),
    // database metadata
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      appPubKeyId: primaryKey({ columns: [table.id], name: "auth_pub_key_id" }),
    };
  },
);
