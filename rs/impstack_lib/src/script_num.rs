// big integers, positive or negative, encoded as big endian, two's complement

extern crate num_bigint;
extern crate num_traits;

use num_bigint::BigInt;
use num_traits::Zero;

#[derive(Debug, Clone)]
pub struct ScriptNum {
    num: BigInt,
}

impl ScriptNum {
    pub fn new(num: BigInt) -> Self {
        ScriptNum { num }
    }

    pub fn from_u8_vec(buffer: &[u8]) -> Self {
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

    pub fn to_u8_vec(&self) -> Vec<u8> {
        if self.num >= Zero::zero() {
            let (_, bytes) = self.num.to_bytes_be();
            bytes
        } else {
            let bit_length = self.num.bits();
            let byte_length = (bit_length + 7) / 8;
            let twos_complement = (BigInt::from(2).pow((byte_length * 8) as u32) + &self.num)
                .to_bytes_be()
                .1;
            twos_complement
        }
    }

    pub fn to_string(&self) -> String {
        self.num.to_str_radix(10)
    }

    pub fn from_string(str: &str) -> Self {
        ScriptNum {
            num: BigInt::parse_bytes(str.as_bytes(), 10).unwrap(),
        }
    }
}
