-- # Primary MySQL database schema
--
-- Goal: Planet Scale-compatible schema (no foreign key constraints)
--
CREATE TABLE `block_buf` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `block_buf` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `tx_buf` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `tx_buf` BLOB NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE merkle_proof_buf (
  -- id
  `merkle_root` binary(32) NOT NULL,
  `tx_id` binary(32) NOT NULL,
  -- data structure
  `merkle_proof_buf` BLOB NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`merkle_root`, `tx_id`)
);

CREATE TABLE `block_header` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `version` int UNSIGNED NOT NULL,
  `prev_block_id` binary(32) NOT NULL,
  `merkle_root` binary(32) NOT NULL,
  `timestamp` bigint UNSIGNED NOT NULL,
  `target` binary(32) NOT NULL,
  `nonce` binary(32) NOT NULL,
  `block_number` bigint UNSIGNED NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`)
);

CREATE TABLE `tx_input` (
  -- id
  `tx_id` binary(32) NOT NULL,
  `tx_in_num` int UNSIGNED NOT NULL,
  -- tx_input
  `input_tx_id` binary(32) NOT NULL,
  `input_tx_out_num` int UNSIGNED NOT NULL,
  `script` BLOB NOT NULL,
  `sequence` int UNSIGNED NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`tx_id`, `tx_in_num`)
);

CREATE TABLE `tx_output` (
  -- id
  `tx_id` binary(32) NOT NULL,
  `tx_out_num` int UNSIGNED NOT NULL,
  -- data structure
  `value` bigint UNSIGNED NOT NULL,
  `script` BLOB NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`tx_id`, `tx_out_num`)
);

CREATE TABLE `tx` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `version` int UNSIGNED NOT NULL,
  `tx_in_count` int UNSIGNED NOT NULL,
  `tx_out_count` int UNSIGNED NOT NULL,
  `lock_time` bigint UNSIGNED NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`)
);

CREATE TABLE `pkh` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `pub_key` BLOB NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `user` (
  -- id
  `id` bigint UNSIGNED AUTO_INCREMENT NOT NULL,
  -- data structure
  `pkh_id` binary(32) NOT NULL,
  `ebx_address` varchar(255) NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `ebx_address` (
  -- id
  `id` varchar(255) NOT NULL,
  -- data structure
  `username` varchar(255),
  -- domain may have null username
  `domain` varchar(255) NOT NULL,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
);