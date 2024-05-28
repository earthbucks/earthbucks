use earthbucks_lib::script_num::*;
use num_bigint::ToBigInt;

#[test]
fn test_script_num() {
    let original_num = ScriptNum::from_iso_str("123456789");
    let bytes = original_num.to_iso_buf();
    let new_num = ScriptNum::from_iso_buf(&bytes);
    assert_eq!(original_num.num, new_num.num);
}

#[test]
fn test_script_num_vectors() {
    let test_cases = vec![
        ("01", "1"),
        ("ff", "-1"),
        ("0100", "256"),
        ("ff00", "-256"),
        ("01000000", "16777216"),
        ("ff000000", "-16777216"),
        ("0100000000000000", "72057594037927936"),
        ("ff00000000000000", "-72057594037927936"),
        (
            "0100000000000000000000000000000000000000000000000000000000000000",
            "452312848583266388373324160190187140051835877600158453279131187530910662656",
        ),
        (
            "ff00000000000000000000000000000000000000000000000000000000000000",
            "-452312848583266388373324160190187140051835877600158453279131187530910662656",
        ),
    ];

    for (hex, dec) in test_cases {
        let num_from_iso_hex = ScriptNum::from_iso_buf(&hex::decode(hex).unwrap());
        let num_from_dec = ScriptNum::from_iso_str(dec);
        assert_eq!(num_from_iso_hex.num, num_from_dec.num);

        let hex_from_num = hex::encode(num_from_iso_hex.to_iso_buf());
        assert_eq!(hex, &hex_from_num);
    }
}

#[test]
fn test_to_iso_buf() {
    let num = 128.to_bigint().unwrap(); // 128 is a positive number with the most significant bit set
    let script_num = ScriptNum { num };
    let bytes = script_num.to_iso_buf();
    assert_eq!(bytes, vec![0, 128]); // 128 in hexadecimal is 80, but we expect an extra '00' at the front
}
