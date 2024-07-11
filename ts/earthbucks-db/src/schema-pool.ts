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
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const PoolUser = mysqlTable(
  "pool_user",
  {
    // id
    id: char("id", { length: 64 }).notNull(),
    // data structure
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    // database metadata
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      appUserId: primaryKey({ columns: [table.id], name: "pool_user_id" }),
      appUserEmail: unique("pool_user_email").on(table.email),
    };
  },
);
