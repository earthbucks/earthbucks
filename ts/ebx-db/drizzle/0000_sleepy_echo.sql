-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `_sqlx_migrations` (
	`version` bigint NOT NULL,
	`description` text NOT NULL,
	`installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`success` tinyint NOT NULL,
	`checksum` blob NOT NULL,
	`execution_time` bigint NOT NULL,
	CONSTRAINT `_sqlx_migrations_version` PRIMARY KEY(`version`)
);
--> statement-breakpoint
CREATE TABLE `db_header` (
	`id` binary(32) NOT NULL,
	`version` int unsigned NOT NULL,
	`prev_block_id` binary(32) NOT NULL,
	`merkle_root` binary(32) NOT NULL,
	`timestamp` bigint unsigned NOT NULL,
	`target` binary(32) NOT NULL,
	`nonce` binary(32) NOT NULL,
	`block_num` bigint unsigned NOT NULL,
	`is_work_valid` tinyint,
	`is_block_valid` tinyint,
	`is_vote_valid` tinyint,
	`domain` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `db_header_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `db_lch` (
	`id` binary(32) NOT NULL,
	`version` int unsigned NOT NULL,
	`prev_block_id` binary(32) NOT NULL,
	`merkle_root` binary(32) NOT NULL,
	`timestamp` bigint unsigned NOT NULL,
	`target` binary(32) NOT NULL,
	`nonce` binary(32) NOT NULL,
	`block_num` bigint unsigned NOT NULL,
	`domain` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `db_lch_id` PRIMARY KEY(`id`),
	CONSTRAINT `block_num_id` UNIQUE(`block_num`,`id`)
);
--> statement-breakpoint
CREATE TABLE `db_merkle_proof` (
	`merkle_root` binary(32) NOT NULL,
	`tx_id` binary(32) NOT NULL,
	`merkle_proof` blob NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `db_merkle_proof_merkle_root_tx_id` PRIMARY KEY(`merkle_root`,`tx_id`)
);
--> statement-breakpoint
CREATE TABLE `db_raw_block` (
	`id` binary(32) NOT NULL,
	`block` blob NOT NULL,
	`is_parsed` tinyint NOT NULL,
	`domain` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `db_raw_block_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `db_tx` (
	`id` binary(32) NOT NULL,
	`tx_buf` blob NOT NULL,
	`version` tinyint NOT NULL,
	`tx_in_count` int unsigned NOT NULL,
	`tx_out_count` int unsigned NOT NULL,
	`lock_time` bigint unsigned NOT NULL,
	`is_valid` tinyint,
	`is_vote_valid` tinyint,
	`confirmed_block_id` binary(32),
	`confirmed_merkle_root` binary(32),
	`domain` varchar(255) NOT NULL,
	`ebx_address` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `db_tx_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `db_tx_input` (
	`tx_id` binary(32) NOT NULL,
	`tx_in_num` int unsigned NOT NULL,
	`input_tx_id` binary(32) NOT NULL,
	`input_tx_out_num` int unsigned NOT NULL,
	`script` blob NOT NULL,
	`sequence` int unsigned NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `db_tx_input_tx_id_tx_in_num` PRIMARY KEY(`tx_id`,`tx_in_num`)
);
--> statement-breakpoint
CREATE TABLE `db_tx_output` (
	`tx_id` binary(32) NOT NULL,
	`tx_out_num` int unsigned NOT NULL,
	`value` bigint unsigned NOT NULL,
	`script` blob NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `db_tx_output_tx_id_tx_out_num` PRIMARY KEY(`tx_id`,`tx_out_num`)
);

*/