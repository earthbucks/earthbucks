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
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { Buffer } from "buffer";
import { FixedBuf } from "earthbucks-lib/src/lib.js";

export const TableAuthSessionToken = mysqlTable(
  "auth_session_token",
  {
    id: binary("id", { length: 16 }).$type<FixedBuf<16>>().notNull().primaryKey(),
    pubKey: binary("pub_key", { length: 33 }).$type<FixedBuf<33>>().notNull(),
    createdAt: datetime("created_at", { mode: "date", fsp: 3 }).notNull(),
    expiresAt: datetime("expires_at", { mode: "date", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("created_at_idx").on(table.createdAt),
    };
  },
);

export type AuthSessionToken = typeof TableAuthSessionToken.$inferSelect;
export type NewAuthSessionToken = typeof TableAuthSessionToken.$inferInsert;
