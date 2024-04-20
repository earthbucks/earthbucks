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
  customType,
  binary,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'
import { customLongBlob } from './custom-types'

export const BuilderHeader = mysqlTable(
  'builder_header',
  {
    // id
    id: binary('id', { length: 32 }).notNull(),
    // data structure
    version: int('version', { unsigned: true }).notNull(),
    prevBlockId: binary('prev_block_id', { length: 32 }).notNull(),
    merkleRoot: binary('merkle_root', { length: 32 }).notNull(),
    timestamp: bigint('timestamp', {
      mode: 'bigint',
      unsigned: true,
    }).notNull(),
    target: binary('target', { length: 32 }).notNull(),
    nonce: binary('nonce', { length: 32 }).notNull(),
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
      mineHeaderId: primaryKey({
        columns: [table.id],
        name: 'builder_header_id',
      }),
    }
  },
)

export const BuilderLch = mysqlTable(
  'builder_lch',
  {
    // id
    id: binary('id', { length: 32 }).notNull(),
    // data structure
    version: int('version', { unsigned: true }).notNull(),
    prevBlockId: binary('prev_block_id', { length: 32 }).notNull(),
    merkleRoot: binary('merkle_root', { length: 32 }).notNull(),
    timestamp: bigint('timestamp', {
      mode: 'bigint',
      unsigned: true,
    }).notNull(),
    target: binary('target', { length: 32 }).notNull(),
    nonce: binary('nonce', { length: 32 }).notNull(),
    blockNum: bigint('block_num', { mode: 'bigint', unsigned: true }).notNull(),
    // database metadata
    domain: varchar('domain', { length: 255 }).notNull(),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineLchId: primaryKey({ columns: [table.id], name: 'builder_lch_id' }),
      blockNumId: unique('block_num_id').on(table.blockNum, table.id),
    }
  },
)

export const BuilderMerkleProof = mysqlTable(
  'builder_merkle_proof',
  {
    // id
    merkleRoot: binary('merkle_root', { length: 32 }).notNull(),
    txId: binary('tx_id', { length: 32 }).notNull(),
    // data structure
    merkleProof: customLongBlob('merkle_proof').notNull(),
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
        name: 'builder_merkle_proof_merkle_root_tx_id',
      }),
    }
  },
)

export const BuilderTxRaw = mysqlTable(
  'builder_tx_raw',
  {
    // id
    id: binary('id', { length: 32 }).notNull(),
    // data structure
    txRaw: customLongBlob('tx_raw').notNull(),
    // database metadata
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineTxId: primaryKey({ columns: [table.id], name: 'builder_tx_id' }),
    }
  },
)

export const BuilderTxParsed = mysqlTable(
  'builder_tx_parsed',
  {
    // id
    id: binary('id', { length: 32 }).notNull(),
    // data structure
    version: tinyint('version', { unsigned: true }).notNull(),
    txInCount: int('tx_in_count', { unsigned: true }).notNull(),
    txOutCount: int('tx_out_count', { unsigned: true }).notNull(),
    lockNum: bigint('lock_num', { mode: 'bigint', unsigned: true }).notNull(),
    // database metadata
    isValid: tinyint('is_valid'),
    isVoteValid: tinyint('is_vote_valid'),
    confirmedBlockId: binary('confirmed_block_id', { length: 32 }),
    confirmedMerkleRoot: binary('confirmed_merkle_root', { length: 32 }),
    domain: varchar('domain', { length: 255 }).notNull(),
    ebxAddress: varchar('earthbucks_address', { length: 255 }),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineTxId: primaryKey({ columns: [table.id], name: 'builder_tx_id' }),
    }
  },
)

export const BuilderTxInput = mysqlTable(
  'builder_tx_input',
  {
    // id
    txId: binary('tx_id', { length: 32 }).notNull(),
    txInNum: int('tx_in_num', { unsigned: true }).notNull(),
    // data structure
    inputTxId: binary('input_tx_id', { length: 32 }).notNull(),
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
        name: 'builder_tx_input_tx_id_tx_in_num',
      }),
    }
  },
)

export const BuilderTxOutput = mysqlTable(
  'builder_tx_output',
  {
    // id
    txId: binary('tx_id', { length: 32 }).notNull(),
    txOutNum: int('tx_out_num', { unsigned: true }).notNull(),
    // data structure
    value: bigint('value', { mode: 'bigint', unsigned: true }).notNull(),
    script: customLongBlob('script').notNull(),
    // database metadata
    spentByTxId: binary('spent_by_tx_id', { length: 32 }),
    spentByTxInNum: int('spent_by_tx_in_num', { unsigned: true }),
    spentInBlockId: binary('spent_in_block_id', { length: 32 }),
    // returnValueHex: text('return_value_hex'),
    createdAt: datetime('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      mineTxOutputTxIdTxOutNum: primaryKey({
        columns: [table.txId, table.txOutNum],
        name: 'builder_tx_output_tx_id_tx_out_num',
      }),
    }
  },
)
