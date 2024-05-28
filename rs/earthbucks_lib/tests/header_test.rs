

    use earthbucks_lib::header::*;
    use num_bigint::BigUint;

    #[test]
    fn test_to_iso_buf_and_from_iso_buf() {
        let bh1 = Header {
            version: 1,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let buf = bh1.to_iso_buf();
        let bh2 = Header::from_iso_buf(buf).unwrap();
        assert_eq!(bh1.version, bh2.version);
        assert_eq!(bh1.prev_block_id, bh2.prev_block_id);
        assert_eq!(bh1.merkle_root, bh2.merkle_root);
        assert_eq!(bh1.timestamp, bh2.timestamp);
        assert_eq!(bh1.target, bh2.target);
        assert_eq!(bh1.nonce, bh2.nonce);
        assert_eq!(bh1.block_num, bh2.block_num);
    }

    #[test]
    fn test_to_buffer() {
        let bh1 = Header {
            version: 1,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let buf = bh1.to_iso_buf();
        let bh2 = Header::from_iso_buf(buf).unwrap();
        assert_eq!(bh1.version, bh2.version);
        assert_eq!(bh1.prev_block_id, bh2.prev_block_id);
        assert_eq!(bh1.merkle_root, bh2.merkle_root);
        assert_eq!(bh1.timestamp, bh2.timestamp);
        assert_eq!(bh1.target, bh2.target);
        assert_eq!(bh1.nonce, bh2.nonce);
        assert_eq!(bh1.block_num, bh2.block_num);
    }

    #[test]
    fn test_is_valid() {
        let bh1 = Header {
            version: 1,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        assert!(bh1.is_valid_in_isolation());
    }

    #[test]
    fn test_is_genesis() {
        let bh1 = Header {
            version: 1,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        assert!(bh1.is_genesis());
    }

    #[test]
    fn test_hash() {
        let bh1 = Header {
            version: 1,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let hash = bh1.hash();
        let hex = hex::encode(hash);
        assert_eq!(
            hex,
            "207308090b4e6af2f1b46b22b849506534536fb39ca5976548f1032e2360ff00"
        );
    }

    #[test]
    fn test_id() {
        let bh1 = Header {
            version: 1,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let id = bh1.id();
        let hex = hex::encode(id);
        assert_eq!(
            hex,
            "24f3f2f083a1accdbc64581b928fbde7f623756c45a17f5730ff7019b424360e"
        );
    }

    #[test]
    fn test_coinbase_amount() {
        assert_eq!(Header::coinbase_amount(0), 10_000_000_000);
        assert_eq!(Header::coinbase_amount(210_000), 5_000_000_000);
        assert_eq!(Header::coinbase_amount(420_000), 2_500_000_000);
        assert_eq!(Header::coinbase_amount(630_000), 1_250_000_000);
        assert_eq!(Header::coinbase_amount(840_000), 625_000_000);
        assert_eq!(Header::coinbase_amount(1_050_000), 312_500_000);
        assert_eq!(Header::coinbase_amount(1_260_000), 156_250_000);

        let mut sum = 0;
        for i in 0..2_000_000 {
            sum += Header::coinbase_amount(i);
        }
        assert_eq!(sum, 4193945312500000);
    }

    #[test]
    fn test_new_target_from_old_targets_1() {
        let target_1_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());

        let target_sum = target_1;
        let real_time_diff: u64 = 600;
        let len: usize = 1;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex = hex::encode(new_target.to_bytes_be());
        let expected_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_1_2() {
        let target_1_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());

        let target_sum = target_1;
        let real_time_diff: u64 = 300;
        let len: usize = 1;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex = hex::encode(new_target.to_bytes_be());
        let expected_hex = "7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_1_3() {
        let target_1_hex = "8000000000000000000000000000000000000000000000000000000000000000";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());

        let target_sum = target_1;
        let real_time_diff: u64 = 600;
        let len: usize = 1;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex = hex::encode(new_target.to_bytes_be());
        let expected_hex = "8000000000000000000000000000000000000000000000000000000000000000";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_1_4() {
        let target_1_hex = "8000000000000000000000000000000000000000000000000000000000000000";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());

        let target_sum = target_1;
        let real_time_diff: u64 = 300;
        let len: usize = 1;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex = hex::encode(new_target.to_bytes_be());
        let expected_hex = "4000000000000000000000000000000000000000000000000000000000000000";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_1_5() {
        let target_1_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());

        let target_sum = target_1;
        let real_time_diff: u64 = 1200;
        let len: usize = 1;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex = hex::encode(new_target.to_bytes_be());
        let expected_hex = "0100000000000000000000000000000000000000000000000000000000000000";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_2() {
        let target_1_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());
        let target_2_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let target_2: BigUint = BigUint::from_bytes_be(&hex::decode(target_2_hex).unwrap());
        let target_sum = target_1 + target_2;
        let real_time_diff: u64 = 600 + 600;
        let len: usize = 2;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex = hex::encode(new_target.to_bytes_be());
        let expected_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_2_2() {
        let target_1_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());
        let target_2_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_2: BigUint = BigUint::from_bytes_be(&hex::decode(target_2_hex).unwrap());
        let target_sum = target_1 + target_2;
        let real_time_diff: u64 = 600 + 300;
        let len: usize = 2;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex: String = format!("{:0>64}", hex::encode(new_target.to_bytes_be()));
        let expected_hex = "0060000000000000000000000000000000000000000000000000000000000000";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_2_3() {
        let target_1_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());
        let target_2_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_2: BigUint = BigUint::from_bytes_be(&hex::decode(target_2_hex).unwrap());
        let target_sum = target_1 + target_2;
        let real_time_diff: u64 = 600 + 1200;
        let len: usize = 2;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex: String = format!("{:0>64}", hex::encode(new_target.to_bytes_be()));
        let expected_hex = "00c0000000000000000000000000000000000000000000000000000000000000";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_3() {
        let target_1_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());
        let target_2_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let target_2: BigUint = BigUint::from_bytes_be(&hex::decode(target_2_hex).unwrap());
        let target_3_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let target_3: BigUint = BigUint::from_bytes_be(&hex::decode(target_3_hex).unwrap());
        let target_sum = target_1 + target_2 + target_3;
        let real_time_diff: u64 = 600 + 600 + 600;
        let len: usize = 3;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex = hex::encode(new_target.to_bytes_be());
        let expected_hex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_3_2() {
        let target_1_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());
        let target_2_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_2: BigUint = BigUint::from_bytes_be(&hex::decode(target_2_hex).unwrap());
        let target_3_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_3: BigUint = BigUint::from_bytes_be(&hex::decode(target_3_hex).unwrap());
        let target_sum = target_1 + target_2 + target_3;
        let real_time_diff: u64 = 600 + 600 + 601;
        let len: usize = 3;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex: String = format!("{:0>64}", hex::encode(new_target.to_bytes_be()));
        let expected_hex = "0080123456789abcdf0123456789abcdf0123456789abcdf0123456789abcdf0";
        assert_eq!(new_target_hex, expected_hex);
    }

    #[test]
    fn test_new_target_from_old_targets_3_3() {
        let target_1_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_1: BigUint = BigUint::from_bytes_be(&hex::decode(target_1_hex).unwrap());
        let target_2_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_2: BigUint = BigUint::from_bytes_be(&hex::decode(target_2_hex).unwrap());
        let target_3_hex = "0080000000000000000000000000000000000000000000000000000000000000";
        let target_3: BigUint = BigUint::from_bytes_be(&hex::decode(target_3_hex).unwrap());
        let target_sum = target_1 + target_2 + target_3;
        let real_time_diff: u64 = 600 + 600 + 599;
        let len: usize = 3;
        let new_target =
            Header::new_target_from_old_targets(target_sum, real_time_diff.into(), len);
        let new_target_hex: String = format!("{:0>64}", hex::encode(new_target.to_bytes_be()));
        let expected_hex = "007fedcba987654320fedcba987654320fedcba987654320fedcba987654320f";
        assert_eq!(new_target_hex, expected_hex);
    }