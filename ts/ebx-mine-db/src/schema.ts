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

export const MineHeader = mysqlTable(
  'mine_header',
  {
    // id
    id: char('id', { length: 64 }).notNull(),
    // data structure
    version: int('version', { unsigned: true }).notNull(),
    prevBlockId: char('prev_block_id', { length: 64 }).notNull(),
    merkleRoot: char('merkle_root', { length: 64 }).notNull(),
    timestamp: bigint('timestamp', {
      mode: 'bigint',
      unsigned: true,
    }).notNull(),
    target: char('target', { length: 64 }).notNull(),
    nonce: char('nonce', { length: 64 }).notNull(),
    blockNum: bigint('block_num', { mode: 'bigint', unsigned: true }).notNull(),
    // database metadata
    isHeaderValid: tinyint('is_header_valid'),
    isBlockValid: tinyint('is_block_valid'),
    isVoteValid: tinyint('is_vote_valid'),
    domain: varchar('domain', { length: 255 }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineHeaderId: primaryKey({ columns: [table.id], name: 'mine_header_id' }),
    }
  },
)

export const MineLch = mysqlTable(
  'mine_lch',
  {
    // id
    id: char('id', { length: 64 }).notNull(),
    // data structure
    version: int('version', { unsigned: true }).notNull(),
    prevBlockId: char('prev_block_id', { length: 64 }).notNull(),
    merkleRoot: char('merkle_root', { length: 64 }).notNull(),
    timestamp: bigint('timestamp', {
      mode: 'bigint',
      unsigned: true,
    }).notNull(),
    target: char('target', { length: 64 }).notNull(),
    nonce: char('nonce', { length: 64 }).notNull(),
    blockNum: bigint('block_num', { mode: 'bigint', unsigned: true }).notNull(),
    // database metadata
    domain: varchar('domain', { length: 255 }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineLchId: primaryKey({ columns: [table.id], name: 'mine_lch_id' }),
      blockNumId: unique('block_num_id').on(table.blockNum, table.id),
    }
  },
)

export const MineMerkleProof = mysqlTable(
  'mine_merkle_proof',
  {
    // id
    merkleRoot: char('merkle_root', { length: 64 }).notNull(),
    txId: char('tx_id', { length: 64 }).notNull(),
    // data structure
    merkleProof: text('merkle_proof').notNull(),
    // database metadata
    position: bigint('position', { mode: 'bigint', unsigned: true }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineMerkleProofMerkleRootTxId: primaryKey({
        columns: [table.merkleRoot, table.txId],
        name: 'mine_merkle_proof_merkle_root_tx_id',
      }),
    }
  },
)

export const MineTxRaw = mysqlTable(
  'mine_tx_raw',
  {
    // id
    id: char('id', { length: 64 }).notNull(),
    // data structure
    txRaw: longtext('tx_raw').notNull(),
    // database metadata
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineTxId: primaryKey({ columns: [table.id], name: 'mine_tx_id' }),
    }
  },
)

export const MineTxParsed = mysqlTable(
  'mine_tx_parsed',
  {
    // id
    id: char('id', { length: 64 }).notNull(),
    // data structure
    version: tinyint('version', { unsigned: true }).notNull(),
    txInCount: int('tx_in_count', { unsigned: true }).notNull(),
    txOutCount: int('tx_out_count', { unsigned: true }).notNull(),
    lockNum: bigint('lock_num', { mode: 'bigint', unsigned: true }).notNull(),
    // database metadata
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
      mineTxId: primaryKey({ columns: [table.id], name: 'mine_tx_id' }),
    }
  },
)

export const MineTxInput = mysqlTable(
  'mine_tx_input',
  {
    // id
    txId: char('tx_id', { length: 64 }).notNull(),
    txInNum: int('tx_in_num', { unsigned: true }).notNull(),
    // data structure
    inputTxId: char('input_tx_id', { length: 64 }).notNull(),
    inputTxOutNum: int('input_tx_out_num', { unsigned: true }).notNull(),
    script: text('script').notNull(),
    sequence: int('sequence', { unsigned: true }).notNull(),
    // database metadata
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineTxInputTxIdTxInNum: primaryKey({
        columns: [table.txId, table.txInNum],
        name: 'mine_tx_input_tx_id_tx_in_num',
      }),
    }
  },
)

export const MineTxOutput = mysqlTable(
  'mine_tx_output',
  {
    // id
    txId: char('tx_id', { length: 64 }).notNull(),
    txOutNum: int('tx_out_num', { unsigned: true }).notNull(),
    // data structure
    value: bigint('value', { mode: 'bigint', unsigned: true }).notNull(),
    script: text('script').notNull(),
    // database metadata
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineTxOutputTxIdTxOutNum: primaryKey({
        columns: [table.txId, table.txOutNum],
        name: 'mine_tx_output_tx_id_tx_out_num',
      }),
    }
  },
)
