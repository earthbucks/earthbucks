-- Add up migration script here
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
  `n_txs` int UNSIGNED NOT NULL,
  `is_work_valid` BOOLEAN,
  `is_block_valid` BOOLEAN,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- primary key
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_block_num` (`block_num`, `id`)
);

-- CREATE TABLE `tx_input` (
--   -- id
--   `tx_id` binary(32) NOT NULL,
--   `tx_in_num` int UNSIGNED NOT NULL,
--   -- tx_input
--   `input_tx_id` binary(32) NOT NULL,
--   `input_tx_out_num` int UNSIGNED NOT NULL,
--   `script` BLOB NOT NULL,
--   `sequence` int UNSIGNED NOT NULL,
--   -- database metadata
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--   -- primary key
--   PRIMARY KEY (`tx_id`, `tx_in_num`)
-- );

-- CREATE TABLE `tx_output` (
--   -- id
--   `tx_id` binary(32) NOT NULL,
--   `tx_out_num` int UNSIGNED NOT NULL,
--   -- data structure
--   `value` bigint UNSIGNED NOT NULL,
--   `script` BLOB NOT NULL,
--   -- database metadata
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--   -- primary key
--   PRIMARY KEY (`tx_id`, `tx_out_num`)
-- );

-- CREATE TABLE `tx` (
--   -- id
--   `id` binary(32) NOT NULL,
--   -- data structure
--   `version` int UNSIGNED NOT NULL,
--   `tx_in_count` int UNSIGNED NOT NULL,
--   `tx_out_count` int UNSIGNED NOT NULL,
--   `lock_time` bigint UNSIGNED NOT NULL,
--   -- database metadata
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--   -- primary key
--   PRIMARY KEY (`id`)
-- );