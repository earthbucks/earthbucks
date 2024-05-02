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

export const TableAuthSigninToken = mysqlTable(
  "auth_signin_token",
  {
    // id
    id: binary("id", { length: 32 }).$type<Buffer>().notNull().primaryKey(),
    // database metadata
    createdAt: datetime("created_at", { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    usedAt: datetime("used_at", { mode: 'date', fsp: 3 }),
    pubKey: binary("pub_key", { length: 33 }).$type<Buffer>(),
    sig: binary("sig", { length: 65 }).$type<Buffer>(),
    mac: binary("mac", { length: 32 }).$type<Buffer>(),
    ipAddress: varchar("ip_address", { length: 255 }),
    expiresAt: datetime("expires_at", { mode: 'date', fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index('created_at_idx').on(table.createdAt),
    };
  },
);

export type AuthSigninToken = typeof TableAuthSigninToken.$inferSelect;
export type NewAuthSigninToken = typeof TableAuthSigninToken.$inferInsert;

export const TableAuthPubKey = mysqlTable(
  "auth_pub_key",
  {
    // id
    id: binary("id", { length: 33 }).$type<Buffer>().notNull().primaryKey(),
    // database metadata
    createdAt: datetime("created_at", { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index('created_at_idx').on(table.createdAt),
    };
  },
);
