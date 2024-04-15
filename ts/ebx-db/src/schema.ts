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
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const dbHeader = mysqlTable(
  'db_header',
  {
    id: char('id', { length: 64 }).notNull(),
    version: int('version', { unsigned: true }).notNull(),
    prevBlockId: char('prev_block_id', { length: 64 }).notNull(),
    merkleRoot: char('merkle_root', { length: 64 }).notNull(),
    timestamp: bigint('timestamp', {
      mode: 'number',
      unsigned: true,
    }).notNull(),
    target: char('target', { length: 64 }).notNull(),
    nonce: char('nonce', { length: 64 }).notNull(),
    blockNum: bigint('block_num', { mode: 'number', unsigned: true }).notNull(),
    isWorkValid: tinyint('is_work_valid'),
    isBlockValid: tinyint('is_block_valid'),
    isVoteValid: tinyint('is_vote_valid'),
    domain: varchar('domain', { length: 255 }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      dbHeaderId: primaryKey({ columns: [table.id], name: 'db_header_id' }),
    }
  },
)

export const dbLch = mysqlTable(
  'db_lch',
  {
    id: char('id', { length: 64 }).notNull(),
    version: int('version', { unsigned: true }).notNull(),
    prevBlockId: char('prev_block_id', { length: 64 }).notNull(),
    merkleRoot: char('merkle_root', { length: 64 }).notNull(),
    timestamp: bigint('timestamp', {
      mode: 'number',
      unsigned: true,
    }).notNull(),
    target: char('target', { length: 64 }).notNull(),
    nonce: char('nonce', { length: 64 }).notNull(),
    blockNum: bigint('block_num', { mode: 'number', unsigned: true }).notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      dbLchId: primaryKey({ columns: [table.id], name: 'db_lch_id' }),
      blockNumId: unique('block_num_id').on(table.blockNum, table.id),
    }
  },
)

export const dbMerkleProof = mysqlTable(
  'db_merkle_proof',
  {
    merkleRoot: char('merkle_root', { length: 64 }).notNull(),
    txId: char('tx_id', { length: 64 }).notNull(),
    merkleProof: text('merkle_proof').notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      dbMerkleProofMerkleRootTxId: primaryKey({
        columns: [table.merkleRoot, table.txId],
        name: 'db_merkle_proof_merkle_root_tx_id',
      }),
    }
  },
)

export const dbRawBlock = mysqlTable(
  'db_raw_block',
  {
    id: char('id', { length: 64 }).notNull(),
    block: longtext('block').notNull(),
    isParsed: tinyint('is_parsed').notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      dbRawBlockId: primaryKey({
        columns: [table.id],
        name: 'db_raw_block_id',
      }),
    }
  },
)

export const dbTx = mysqlTable(
  'db_tx',
  {
    id: char('id', { length: 64 }).notNull(),
    tx: longtext('tx').notNull(),
    version: tinyint('version', { unsigned: true }).notNull(),
    txInCount: int('tx_in_count', { unsigned: true }).notNull(),
    txOutCount: int('tx_out_count', { unsigned: true }).notNull(),
    lockTime: bigint('lock_time', { mode: 'number', unsigned: true }).notNull(),
    isValid: tinyint('is_valid'),
    isVoteValid: tinyint('is_vote_valid'),
    confirmedBlockId: char('confirmed_block_id', { length: 64 }),
    confirmedMerkleRoot: char('confirmed_merkle_root', { length: 64 }),
    domain: varchar('domain', { length: 255 }).notNull(),
    ebxAddress: varchar('ebx_address', { length: 255 }),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      dbTxId: primaryKey({ columns: [table.id], name: 'db_tx_id' }),
    }
  },
)

export const dbTxInput = mysqlTable(
  'db_tx_input',
  {
    txId: char('tx_id', { length: 64 }).notNull(),
    txInNum: int('tx_in_num', { unsigned: true }).notNull(),
    inputTxId: char('input_tx_id', { length: 64 }).notNull(),
    inputTxOutNum: int('input_tx_out_num', { unsigned: true }).notNull(),
    script: text('script').notNull(),
    sequence: int('sequence', { unsigned: true }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      dbTxInputTxIdTxInNum: primaryKey({
        columns: [table.txId, table.txInNum],
        name: 'db_tx_input_tx_id_tx_in_num',
      }),
    }
  },
)

export const dbTxOutput = mysqlTable(
  'db_tx_output',
  {
    txId: char('tx_id', { length: 64 }).notNull(),
    txOutNum: int('tx_out_num', { unsigned: true }).notNull(),
    value: bigint('value', { mode: 'number', unsigned: true }).notNull(),
    script: text('script').notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      dbTxOutputTxIdTxOutNum: primaryKey({
        columns: [table.txId, table.txOutNum],
        name: 'db_tx_output_tx_id_tx_out_num',
      }),
    }
  },
)
