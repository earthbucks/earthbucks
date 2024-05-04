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

export const TableAuthSessionToken = mysqlTable(
  "auth_session_token",
  {
    id: binary("id", { length: 16 }).$type<Buffer>().notNull().primaryKey(),
    pubKey: binary("pub_key", { length: 33 }).$type<Buffer>().notNull(),
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
