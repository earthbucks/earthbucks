import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, bigint, text, timestamp, tinyint, binary, varchar, datetime, unique, int } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const dbHeader = mysqlTable("db_header", {
	id: binary("id", { length: 32 }).notNull(),
	version: int("version", { unsigned: true }).notNull(),
	prevBlockId: binary("prev_block_id", { length: 32 }).notNull(),
	merkleRoot: binary("merkle_root", { length: 32 }).notNull(),
	timestamp: bigint("timestamp", { mode: "number", unsigned: true }).notNull(),
	target: binary("target", { length: 32 }).notNull(),
	nonce: binary("nonce", { length: 32 }).notNull(),
	blockNum: bigint("block_num", { mode: "number", unsigned: true }).notNull(),
	isWorkValid: tinyint("is_work_valid"),
	isBlockValid: tinyint("is_block_valid"),
	isVoteValid: tinyint("is_vote_valid"),
	domain: varchar("domain", { length: 255 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		dbHeaderId: primaryKey({ columns: [table.id], name: "db_header_id"}),
	}
});

export const dbLch = mysqlTable("db_lch", {
	id: binary("id", { length: 32 }).notNull(),
	version: int("version", { unsigned: true }).notNull(),
	prevBlockId: binary("prev_block_id", { length: 32 }).notNull(),
	merkleRoot: binary("merkle_root", { length: 32 }).notNull(),
	timestamp: bigint("timestamp", { mode: "number", unsigned: true }).notNull(),
	target: binary("target", { length: 32 }).notNull(),
	nonce: binary("nonce", { length: 32 }).notNull(),
	blockNum: bigint("block_num", { mode: "number", unsigned: true }).notNull(),
	domain: varchar("domain", { length: 255 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		dbLchId: primaryKey({ columns: [table.id], name: "db_lch_id"}),
		blockNumId: unique("block_num_id").on(table.blockNum, table.id),
	}
});

export const dbMerkleProof = mysqlTable("db_merkle_proof", {
	merkleRoot: binary("merkle_root", { length: 32 }).notNull(),
	txId: binary("tx_id", { length: 32 }).notNull(),
	merkleProof: binary("merkle_proof").notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		dbMerkleProofMerkleRootTxId: primaryKey({ columns: [table.merkleRoot, table.txId], name: "db_merkle_proof_merkle_root_tx_id"}),
	}
});

export const dbRawBlock = mysqlTable("db_raw_block", {
	id: binary("id", { length: 32 }).notNull(),
	block: binary("block").notNull(),
	isParsed: tinyint("is_parsed").notNull(),
	domain: varchar("domain", { length: 255 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		dbRawBlockId: primaryKey({ columns: [table.id], name: "db_raw_block_id"}),
	}
});

export const dbTx = mysqlTable("db_tx", {
	id: binary("id", { length: 32 }).notNull(),
	txBuf: binary("tx_buf").notNull(),
	version: tinyint("version").notNull(),
	txInCount: int("tx_in_count", { unsigned: true }).notNull(),
	txOutCount: int("tx_out_count", { unsigned: true }).notNull(),
	lockTime: bigint("lock_time", { mode: "number", unsigned: true }).notNull(),
	isValid: tinyint("is_valid"),
	isVoteValid: tinyint("is_vote_valid"),
	confirmedBlockId: binary("confirmed_block_id", { length: 32 }),
	confirmedMerkleRoot: binary("confirmed_merkle_root", { length: 32 }),
	domain: varchar("domain", { length: 255 }).notNull(),
	ebxAddress: varchar("ebx_address", { length: 255 }),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		dbTxId: primaryKey({ columns: [table.id], name: "db_tx_id"}),
	}
});

export const dbTxInput = mysqlTable("db_tx_input", {
	txId: binary("tx_id", { length: 32 }).notNull(),
	txInNum: int("tx_in_num", { unsigned: true }).notNull(),
	inputTxId: binary("input_tx_id", { length: 32 }).notNull(),
	inputTxOutNum: int("input_tx_out_num", { unsigned: true }).notNull(),
	script: binary("script").notNull(),
	sequence: int("sequence", { unsigned: true }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		dbTxInputTxIdTxInNum: primaryKey({ columns: [table.txId, table.txInNum], name: "db_tx_input_tx_id_tx_in_num"}),
	}
});

export const dbTxOutput = mysqlTable("db_tx_output", {
	txId: binary("tx_id", { length: 32 }).notNull(),
	txOutNum: int("tx_out_num", { unsigned: true }).notNull(),
	value: bigint("value", { mode: "number", unsigned: true }).notNull(),
	script: binary("script").notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		dbTxOutputTxIdTxOutNum: primaryKey({ columns: [table.txId, table.txOutNum], name: "db_tx_output_tx_id_tx_out_num"}),
	}
});