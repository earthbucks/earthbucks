use byteorder::{BigEndian, WriteBytesExt};
use earthbucks_lib::iso_buf_writer::*;

#[test]
fn test_get_length() {
    let mut writer = IsoBufWriter::new();
    assert_eq!(writer.get_length(), 0);

    writer.write_u8(1);
    assert_eq!(writer.get_length(), 1);

    writer.write_iso_buf(vec![2, 3, 4]);
    assert_eq!(writer.get_length(), 4);
}

#[test]
fn test_to_iso_buf() {
    let mut writer = IsoBufWriter::new();
    writer.write_iso_buf(vec![1, 2, 3]);
    writer.write_iso_buf(vec![4, 5, 6]);

    let result = writer.to_iso_buf();
    assert_eq!(result, vec![1, 2, 3, 4, 5, 6]);
}

#[test]
fn test_write_iso_buf() {
    let mut writer = IsoBufWriter::new();
    writer.write_iso_buf(vec![1, 2, 3]);

    assert_eq!(writer.bufs.len(), 1);
    assert_eq!(writer.bufs[0], vec![1, 2, 3]);
}

#[test]
fn test_write_reverse() {
    let mut writer = IsoBufWriter::new();
    writer.write_reverse(vec![1, 2, 3]);

    assert_eq!(writer.bufs.len(), 1);
    assert_eq!(writer.bufs[0], vec![3, 2, 1]);
}

#[test]
fn test_write_u8() {
    let mut writer = IsoBufWriter::new();
    writer.write_u8(1);

    assert_eq!(writer.bufs.len(), 1);
    assert_eq!(writer.bufs[0], vec![1]);
}

#[test]
fn test_write_u16_be() {
    let mut writer = IsoBufWriter::new();
    writer.write_u16_be(0x0102);

    assert_eq!(writer.bufs.len(), 1);
    assert_eq!(writer.bufs[0], vec![1, 2]); // 0x0102 in big-endian is [1, 2]
}

#[test]
fn test_write_u32_be() {
    let mut writer = IsoBufWriter::new();
    writer.write_u32_be(0x01020304);

    assert_eq!(writer.bufs.len(), 1);
    assert_eq!(writer.bufs[0], vec![1, 2, 3, 4]); // 0x01020304 in big-endian is [1, 2, 3, 4]
}

#[test]
fn test_write_u64_be() {
    let mut writer = IsoBufWriter::new();
    writer.write_u64_be(0x0102030405060708);

    assert_eq!(writer.bufs.len(), 1);
    assert_eq!(writer.bufs[0], vec![1, 2, 3, 4, 5, 6, 7, 8]); // 0x0102030405060708 in big-endian is [1, 2, 3, 4, 5, 6, 7, 8]
}

#[test]
fn test_var_int_buf() {
    // Test case where n < 253
    let buf: Vec<u8> = vec![100];
    assert_eq!(IsoBufWriter::var_int_buf(100), buf);

    // Test case where 253 <= n < 0x10000
    let mut buf = vec![];
    buf.push(253);
    buf.write_u16::<BigEndian>(0x0102).unwrap();
    assert_eq!(IsoBufWriter::var_int_buf(0x0102), buf);

    // Test case where 0x10000 <= n < 0x100000000
    let mut buf = vec![];
    buf.push(254);
    buf.write_u32::<BigEndian>(0x01020304).unwrap();
    assert_eq!(IsoBufWriter::var_int_buf(0x01020304), buf);

    // Test case where n >= 0x100000000
    let mut buf = vec![];
    buf.push(255);
    buf.write_u64::<BigEndian>(0x0102030405060708).unwrap();
    assert_eq!(IsoBufWriter::var_int_buf(0x0102030405060708), buf);
}

#[test]
fn test_write_var_int() {
    // Test case where n < 253
    let mut writer = IsoBufWriter::new();
    writer.write_var_int(100);
    assert_eq!(writer.bufs.len(), 1);
    assert_eq!(writer.bufs[0], vec![100]);

    // Test case where 253 <= n < 0x10000
    let mut writer = IsoBufWriter::new();
    writer.write_var_int(0x0102);
    assert_eq!(writer.bufs.len(), 1);
    let mut expected = vec![253];
    expected.write_u16::<BigEndian>(0x0102).unwrap();
    assert_eq!(writer.bufs[0], expected);

    // Test case where 0x10000 <= n < 0x100000000
    let mut writer = IsoBufWriter::new();
    writer.write_var_int(0x01020304);
    assert_eq!(writer.bufs.len(), 1);
    let mut expected = vec![254];
    expected.write_u32::<BigEndian>(0x01020304).unwrap();
    assert_eq!(writer.bufs[0], expected);

    // Test case where n >= 0x100000000
    let mut writer = IsoBufWriter::new();
    writer.write_var_int(0x0102030405060708);
    assert_eq!(writer.bufs.len(), 1);
    let mut expected = vec![255];
    expected.write_u64::<BigEndian>(0x0102030405060708).unwrap();
    assert_eq!(writer.bufs[0], expected);
}
