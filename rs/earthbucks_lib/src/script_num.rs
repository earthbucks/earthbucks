// big integers, positive or negative, encoded as big endian, two's complement

extern crate num_bigint;
extern crate num_traits;
use crate::strict_hex::StrictHex;
use num_bigint::BigInt;
use num_traits::ToPrimitive;
use num_traits::Zero;

#[derive(Debug, Clone)]
pub struct ScriptNum {
    pub num: BigInt,
}

impl ScriptNum {
    pub fn new(num: BigInt) -> Self {
        ScriptNum { num }
    }

    pub fn from_usize(num: usize) -> Self {
        ScriptNum {
            num: BigInt::from(num),
        }
    }

    pub fn from_u32(num: u32) -> Self {
        ScriptNum {
            num: BigInt::from(num),
        }
    }

    pub fn from_u64(num: u64) -> Self {
        ScriptNum {
            num: BigInt::from(num),
        }
    }

    pub fn from_iso_buf(buffer: &[u8]) -> Self {
        if buffer.is_empty() {
            return ScriptNum { num: Zero::zero() };
        }
        let is_negative = buffer[0] & 0x80 != 0;
        let num = if is_negative {
            let inverted_buffer: Vec<u8> = buffer.iter().map(|b| !b).collect();
            let inverted_bigint = BigInt::from_bytes_be(num_bigint::Sign::Plus, &inverted_buffer);
            -(inverted_bigint + BigInt::from(1))
        } else {
            BigInt::from_bytes_be(num_bigint::Sign::Plus, buffer)
        };
        ScriptNum { num }
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        match self.num.cmp(&Zero::zero()) {
            std::cmp::Ordering::Equal => vec![],
            std::cmp::Ordering::Greater => {
                let (_, mut bytes) = self.num.to_bytes_be();
                // If the most significant bit is set, prepend an extra zero byte
                if bytes[0] & 0x80 != 0 {
                    bytes.insert(0, 0);
                }
                bytes
            }
            std::cmp::Ordering::Less => {
                let bit_length = self.num.bits();
                let byte_length = (bit_length + 7) / 8;
                (BigInt::from(2).pow((byte_length * 8) as u32) + &self.num)
                    .to_bytes_be()
                    .1
            }
        }
    }

    pub fn from_iso_hex(hex: &str) -> Self {
        ScriptNum::from_iso_buf(&Vec::<u8>::from_strict_hex(hex).unwrap())
    }

    pub fn to_iso_hex(&self) -> String {
        hex::encode(self.to_iso_buf())
    }

    pub fn to_iso_str(&self) -> String {
        self.num.to_str_radix(10)
    }

    pub fn from_iso_str(str: &str) -> Self {
        ScriptNum {
            num: BigInt::parse_bytes(str.as_bytes(), 10).unwrap(),
        }
    }

    pub fn to_u32(&self) -> u32 {
        self.num.to_u32().unwrap()
    }

    pub fn to_u64(&self) -> u64 {
        self.num.to_u64().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
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
            let num_from_iso_hex =
                ScriptNum::from_iso_buf(&Vec::<u8>::from_strict_hex(hex).unwrap());
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
}
