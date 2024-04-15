CREATE TABLE `header` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `version` int UNSIGNED NOT NULL,
  `prev_block_id` binary(32) NOT NULL,
  `merkle_root` binary(32) NOT NULL,
  `timestamp` bigint UNSIGNED NOT NULL,
  `target` binary(32) NOT NULL,
  `nonce` binary(32) NOT NULL,
  `block_num` bigint UNSIGNED NOT NULL,
  -- database metadata
  `is_work_valid` BOOLEAN,
  `is_block_valid` BOOLEAN,
  `is_vote_valid` BOOLEAN,
  `domain` varchar(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`)
);

-- longest chain header
CREATE TABLE `lch` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `version` int UNSIGNED NOT NULL,
  `prev_block_id` binary(32) NOT NULL,
  `merkle_root` binary(32) NOT NULL,
  `timestamp` bigint UNSIGNED NOT NULL,
  `target` binary(32) NOT NULL,
  `nonce` binary(32) NOT NULL,
  `block_num` bigint UNSIGNED NOT NULL,
  -- database metadata
  `domain` varchar(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`),
  UNIQUE KEY `block_num_id` (`block_num`, `id`)
);

CREATE TABLE `merkle_proof` (
  -- id
  `merkle_root` binary(32) NOT NULL,
  `tx_id` binary(32) NOT NULL,
  -- data structure
  `merkle_proof` BLOB NOT NULL,
  -- database metadata
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`merkle_root`, `tx_id`)
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
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`tx_id`, `tx_out_num`)
);

CREATE TABLE `tx` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `version` tinyint UNSIGNED NOT NULL,
  `tx_in_count` int UNSIGNED NOT NULL,
  `tx_out_count` int UNSIGNED NOT NULL,
  `lock_time` bigint UNSIGNED NOT NULL,
  -- database metadata
  `is_valid` BOOLEAN,
  `is_vote_valid` BOOLEAN,
  `confirmed_block_id` binary(32),
  `confirmed_merkle_root` binary(32),
  `domain` varchar(255) NOT NULL,
  `ebx_address` varchar(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`)
);

CREATE TABLE `raw_block` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `block` BLOB NOT NULL,
  -- database metadata
  `is_parsed` BOOLEAN NOT NULL,
  `domain` varchar(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`)
);

create table `raw_tx` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `tx` BLOB NOT NULL,
  -- database metadata
  `is_parsed` BOOLEAN NOT NULL,
  `domain` varchar(255) NOT NULL,
  `ebx_address` varchar(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`)
);