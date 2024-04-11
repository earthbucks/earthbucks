CREATE TABLE `block_buf` (
  -- id
  `id` binary(32) NOT NULL,
  -- block_buf
  `block_buf` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `tx_buf` (
  -- id
  `id` binary(32) NOT NULL,
  -- tx_buf
  `tx_buf` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `block_header` (
  -- id
  `id` binary(32) NOT NULL,
  -- block_header
  `version` int UNSIGNED,
  `prev_block_id` binary(32),
  `merkle_root` binary(32),
  `timestamp` bigint UNSIGNED,
  `target` binary(32),
  `nonce` binary(32),
  `block_number` bigint UNSIGNED,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- primary key
  PRIMARY KEY (`id`)
);

CREATE TABLE `tx_input` (
  -- id
  `tx_id` binary(32),
  `tx_in_num` int UNSIGNED,
  -- tx_input
  `input_tx_id` binary(32),
  `input_tx_out_num` int UNSIGNED,
  `script` BLOB,
  `sequence` int UNSIGNED,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- primary key
  PRIMARY KEY (`tx_id`, `tx_in_num`)
);

CREATE TABLE `tx_output` (
  -- id
  `tx_id` binary(32),
  `tx_out_num` int UNSIGNED,
  -- tx_output
  `value` bigint UNSIGNED,
  `script` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- primary key
  PRIMARY KEY (`tx_id`, `tx_out_num`)
);

CREATE TABLE `tx` (
  -- id
  `id` binary(32) NOT NULL,
  -- transaction
  `version` int UNSIGNED,
  `tx_in_count` int UNSIGNED,
  `tx_out_count` int UNSIGNED,
  `lock_time` bigint UNSIGNED,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- primary key
  PRIMARY KEY (`id`)
);