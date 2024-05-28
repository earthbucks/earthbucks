// big integers, positive or negative, encoded as big endian, two's complement

extern crate num_bigint;
extern crate num_traits;
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
        ScriptNum::from_iso_buf(&hex::decode(hex).unwrap())
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
