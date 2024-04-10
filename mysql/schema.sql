CREATE TABLE `block_header` (
  `id` binary(32) NOT NULL,
  `version` int UNSIGNED,
  `prev_block_id` binary(32),
  `merkle_root` binary(32),
  `timestamp` bigint UNSIGNED,
  `target` binary(32),
  `nonce` binary(32),
  `block_index` bigint UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`)
)

CREATE INDEX idx_block_header_block_index ON block_header(`block_index`);