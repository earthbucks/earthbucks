CREATE TABLE `block_header` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
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
  -- data structure
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
  -- data structure
  `version` int UNSIGNED,
  `tx_in_count` int UNSIGNED,
  `tx_out_count` int UNSIGNED,
  `lock_time` bigint UNSIGNED,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- primary key
  PRIMARY KEY (`id`)
);

CREATE TABLE merkle_proof (
  -- id
  `block_id` binary(32),
  `tx_id` binary(32),
  -- data structure
  `merkle_proof` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- primary key
  PRIMARY KEY (`block_id`, `tx_id`)
);

CREATE TABLE `block_buf` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `block_buf` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `tx_buf` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `tx_buf` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `pkh` (
  -- id
  `id` binary(32) NOT NULL,
  -- data structure
  `pub_key` BLOB,
  -- database metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);