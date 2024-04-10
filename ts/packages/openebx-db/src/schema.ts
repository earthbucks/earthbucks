import type { MySqlTransaction } from 'drizzle-orm/mysql-core'
import {
  mysqlTable,
  mysqlSchema,
  AnyMySqlColumn,
  index,
  primaryKey,
  unique,
  varchar,
  datetime,
  text,
  mediumtext,
  json,
  tinyint,
  int,
  mysqlEnum,
  longtext,
  date,
} from 'drizzle-orm/mysql-core'
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import type {
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
} from 'drizzle-orm/mysql2'

export type DrizzleTransaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>

export const TableEmailLoginToken = mysqlTable(
  'EmailLoginToken',
  {
    id: varchar('id', { length: 255 }).notNull(),
    createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    expiresAt: datetime('expiresAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    email: varchar('email', { length: 255 }),
    ipAddress: varchar('ipAddress', { length: 255 }),
  },
  (table) => {
    return {
      authTokenId: primaryKey({ columns: [table.id] }),
      emailIdx: index('EmailLoginToken_email_idx').on(table.email),
      expiresAtIdx: index('EmailLoginToken_expiresAt_idx').on(table.expiresAt),
    }
  },
)

export type EmailLoginToken = typeof TableEmailLoginToken.$inferSelect
export type NewEmailLoginToken = typeof TableEmailLoginToken.$inferInsert

export const TableEmailVerificationToken = mysqlTable(
  'EmailVerificationToken',
  {
    id: varchar('id', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    ipAddress: varchar('ipAddress', { length: 255 }),
    createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    expiresAt: datetime('expiresAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (table) => {
    return {
      emailVerificationTokenId: primaryKey({ columns: [table.id] }),
      emailIdx: index('EmailVerificationToken_email_idx').on(table.email),
      expiresAtIdx: index('EmailVerificationToken_expiresAt_idx').on(
        table.expiresAt,
      ),
    }
  },
)

export type EmailVerificationToken =
  typeof TableEmailVerificationToken.$inferSelect
export type NewEmailVerificationToken =
  typeof TableEmailVerificationToken.$inferInsert

export const TableEmail = mysqlTable(
  'Email',
  {
    id: varchar('id', { length: 255 }).notNull(), // normalized email
    createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    userId: varchar('userId', { length: 255 }).notNull(),
  },
  (table) => {
    return {
      emailIdx: index('Email_email_idx').on(table.email),
      userIdIdx: index('Email_userId_idx').on(table.userId),
      emailId: primaryKey({ columns: [table.id] }),
      createdAtIdx: index('Email_createdAt_idx').on(table.createdAt),
      emailUserIdKey: unique('Email_userId_key').on(table.email, table.userId),
    }
  },
)

export type Email = typeof TableEmail.$inferSelect
export type NewEmail = typeof TableEmail.$inferInsert

export const TableUser = mysqlTable(
  'User',
  {
    id: varchar('id', { length: 255 }).notNull(),
    createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    primaryEmailId: varchar('primaryEmailId', { length: 255 }).notNull(),
    nEmails: int('nEmails').default(1).notNull(),
    emailToVerify: varchar('emailToVerify', { length: 255 }),
  },
  (table) => {
    return {
      userIdIdx: index('User_userId_idx').on(table.id),
      primaryEmailIdIdx: index('User_primaryEmailId_idx').on(
        table.primaryEmailId,
      ),
      createdAtIdx: index('User_createdAt_idx').on(table.createdAt),
      userId: primaryKey({ columns: [table.id] }),
    }
  },
)

export type User = typeof TableUser.$inferSelect
export type NewUser = typeof TableUser.$inferInsert
