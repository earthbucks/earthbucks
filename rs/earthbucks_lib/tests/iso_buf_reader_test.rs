use byteorder::{BigEndian, WriteBytesExt};
use earthbucks_lib::iso_buf_reader::*;
use serde::Deserialize;
use std::fs;

#[test]
fn test_read() {
    let mut reader = IsoBufReader::new(vec![1, 2, 3, 4, 5]);
    assert_eq!(reader.read(3).unwrap(), vec![1, 2, 3]);
    assert_eq!(reader.read(2).unwrap(), vec![4, 5]);
}

#[test]
fn test_read_u8() {
    let mut reader = IsoBufReader::new(vec![1, 2, 3, 4, 5]);
    assert_eq!(reader.read_u8().unwrap(), 1);
    assert_eq!(reader.read_u8().unwrap(), 2);
}

#[test]
fn test_read_u16_be() {
    let mut buffer_reader = IsoBufReader::new(vec![0x01, 0x23]);
    assert_eq!(buffer_reader.read_u16_be().unwrap(), 0x0123);
}

#[test]
fn test_read_u32_be() {
    let mut data = vec![];
    data.write_u32::<BigEndian>(1234567890).unwrap();
    data.write_u32::<BigEndian>(987654321).unwrap();

    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_u32_be().unwrap(), 1234567890);
    assert_eq!(reader.read_u32_be().unwrap(), 987654321);
}

#[test]
fn test_read_u64_be_big_int() {
    let mut data = vec![];
    data.write_u64::<BigEndian>(12345678901234567890).unwrap();
    data.write_u64::<BigEndian>(9876543210987654321).unwrap();

    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_u64_be().unwrap(), 12345678901234567890);
    assert_eq!(reader.read_u64_be().unwrap(), 9876543210987654321);
}

#[test]
fn test_read_var_int_buf() {
    let data = vec![0xfd, 0x01, 0x00];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_var_int_buf().unwrap(), vec![0xfd, 0x01, 0x00]);

    let data = vec![0xfe, 0x01, 0x00, 0x00, 0x00];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(
        reader.read_var_int_buf().unwrap(),
        vec![0xfe, 0x01, 0x00, 0x00, 0x00]
    );

    let data = vec![0xff, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(
        reader.read_var_int_buf().unwrap(),
        vec![0xff, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    );

    let data = vec![0x01];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_var_int_buf().unwrap(), vec![0x01]);
}

#[test]
fn test_read_var_int() {
    let data = vec![0xfd, 0x10, 0x01];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_var_int().unwrap(), 0x1000 + 1);

    let data = vec![0xfe, 0x10, 0x00, 0x00, 0x01];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_var_int().unwrap(), 0x10000000 + 1);

    let data = vec![0xff, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_var_int().unwrap(), 0x1000000000000000 + 1);

    let data = vec![0x01];
    let mut reader = IsoBufReader::new(data);
    assert_eq!(reader.read_var_int().unwrap(), 1);
}

// standard test vectors

#[derive(Deserialize)]
struct TestVectorIsoBufReader {
    read: TestVectorReadIsoBuf,
    read_u8: TestVectorReadErrors,
    read_u16_be: TestVectorReadErrors,
    read_u32_be: TestVectorReadErrors,
    read_u64_be: TestVectorReadErrors,
    read_var_int_buf: TestVectorReadErrors,
    read_var_int: TestVectorReadErrors,
}

#[derive(Deserialize)]
struct TestVectorReadIsoBuf {
    errors: Vec<TestVectorReadIsoBufError>,
}

#[derive(Deserialize)]
struct TestVectorReadIsoBufError {
    hex: String,
    len: usize,
    error: String,
}

#[derive(Deserialize)]
struct TestVectorReadErrors {
    errors: Vec<TestVectorReadError>,
}

#[derive(Deserialize)]
struct TestVectorReadError {
    hex: String,
    error: String,
}

#[test]
fn test_vectors_read() {
    let data =
        fs::read_to_string("./test_vectors/iso_buf_reader.json").expect("Unable to read file");
    let test_vectors: TestVectorIsoBufReader =
        serde_json::from_str(&data).expect("Unable to parse JSON");
    for test_vector in test_vectors.read.errors {
        let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
        let mut reader = IsoBufReader::new(buf);
        let result = reader.read(test_vector.len);
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
        }
    }
}

#[test]
fn test_vectors_read_u8() {
    let data =
        fs::read_to_string("./test_vectors/iso_buf_reader.json").expect("Unable to read file");
    let test_vectors: TestVectorIsoBufReader =
        serde_json::from_str(&data).expect("Unable to parse JSON");
    for test_vector in test_vectors.read_u8.errors {
        let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
        let mut reader = IsoBufReader::new(buf);
        let result = reader.read_u8();
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert_eq!(e.to_string(), test_vector.error),
        }
    }
}

#[test]
fn test_vectors_read_u16_be() {
    let data =
        fs::read_to_string("./test_vectors/iso_buf_reader.json").expect("Unable to read file");
    let test_vectors: TestVectorIsoBufReader =
        serde_json::from_str(&data).expect("Unable to parse JSON");
    for test_vector in test_vectors.read_u16_be.errors {
        let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
        let mut reader = IsoBufReader::new(buf);
        let result = reader.read_u16_be();
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
        }
    }
}

#[test]
fn test_vectors_read_u32_be() {
    let data =
        fs::read_to_string("./test_vectors/iso_buf_reader.json").expect("Unable to read file");
    let test_vectors: TestVectorIsoBufReader =
        serde_json::from_str(&data).expect("Unable to parse JSON");
    for test_vector in test_vectors.read_u32_be.errors {
        let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
        let mut reader = IsoBufReader::new(buf);
        let result = reader.read_u32_be();
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
        }
    }
}

#[test]
fn test_vectors_read_u64_be() {
    let data =
        fs::read_to_string("./test_vectors/iso_buf_reader.json").expect("Unable to read file");
    let test_vectors: TestVectorIsoBufReader =
        serde_json::from_str(&data).expect("Unable to parse JSON");
    for test_vector in test_vectors.read_u64_be.errors {
        let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
        let mut reader = IsoBufReader::new(buf);
        let result = reader.read_u64_be();
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
        }
    }
}

#[test]
fn test_vectors_read_var_int_buf() {
    let data =
        fs::read_to_string("./test_vectors/iso_buf_reader.json").expect("Unable to read file");
    let test_vectors: TestVectorIsoBufReader =
        serde_json::from_str(&data).expect("Unable to parse JSON");
    for test_vector in test_vectors.read_var_int_buf.errors {
        let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
        let mut reader = IsoBufReader::new(buf);
        let result = reader.read_var_int_buf();
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
        }
    }
}

#[test]
fn test_vectors_read_var_int() {
    let data =
        fs::read_to_string("./test_vectors/iso_buf_reader.json").expect("Unable to read file");
    let test_vectors: TestVectorIsoBufReader =
        serde_json::from_str(&data).expect("Unable to parse JSON");
    for test_vector in test_vectors.read_var_int.errors {
        let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
        let mut reader = IsoBufReader::new(buf);
        let result = reader.read_var_int();
        match result {
            Ok(_) => panic!("Expected an error, but got Ok(_)"),
            Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
        }
    }
}
