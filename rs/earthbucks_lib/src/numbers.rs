pub use bnum::types::U256 as u256;

// pub use num256::uint256::Uint256 as u256;
// use num_bigint::BigUint;

// use crate::ebx_error::EbxError;

// pub struct MyU256 {
//     value: BigUint,
// }

// impl MyU256 {
//     pub fn new(value: BigUint) -> Result<Self, EbxError> {
//         let min = BigUint::from_bytes_be(&[0; 32]);
//         let max = BigUint::from_bytes_be(&[255; 32]);
//         if value < min || value > max {
//             return Err(EbxError::GenericError { source: None, message: "Value out of range".to_string()});
//         }
//         Ok(Self { value })
//     }

//     pub fn add(&self, other: &MyU256) -> Result<MyU256, EbxError> {
//         let result = &self.value + &other.value;
//         MyU256::new(result)
//     }

//     pub fn sub(&self, other: &MyU256) -> Result<MyU256, EbxError> {
//         let result = &self.value - &other.value;
//         MyU256::new(result)
//     }

//     pub fn mul(&self, other: &MyU256) -> Result<MyU256, EbxError> {
//         let result = &self.value * &other.value;
//         MyU256::new(result)
//     }

//     pub fn div(&self, other: &MyU256) -> Result<MyU256, EbxError> {
//         if other.value == BigUint::from(0u32) {
//             return Err(EbxError::GenericError { source: None, message: "Division by zero".to_string()});
//         }
//         let result = &self.value / &other.value;
//         MyU256::new(result)
//     }

//     pub fn get_bn(&self) -> BigUint {
//         self.value.clone()
//     }
// }

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use num256::uint256::Uint256;

//     // u256

//     #[test]
//     fn test_max_value() {
//         let max_value = Uint256::from_be_bytes(&[255; 32]);
//         let u = u256::from_be_bytes(&[255; 32]);
//         assert_eq!(u, max_value, "Max value test failed");
//     }

//     #[test]
//     fn test_beyond_max_value() {
//         let u = u256::from_be_bytes(&[255; 32]);
//         let result = u.checked_add(u256::from(1u32).to_be());
//         assert!(result.is_none(), "Beyond max value test failed");
//     }

//     #[test]
//     fn test_min_value() {
//         let min_value = Uint256::from_be_bytes(&[0; 32]);
//         let u = u256::from_be_bytes(&[0; 32]);
//         assert_eq!(u, min_value, "Min value test failed");
//     }

//     #[test]
//     fn test_addition() {
//         let a = u256::from(5u32);
//         let b = u256::from(10u32);
//         assert_eq!(a + b, u256::from(15u32), "Addition test failed");
//     }

//     #[test]
//     fn test_subtraction() {
//         let a = u256::from(10u32);
//         let b = u256::from(5u32);
//         assert_eq!(a - b, u256::from(5u32), "Subtraction test failed");
//     }

//     #[test]
//     fn test_multiplication() {
//         let a = u256::from(5u32);
//         let b = u256::from(10u32);
//         assert_eq!(a * b, u256::from(50u32), "Multiplication test failed");
//     }

//     #[test]
//     fn test_division() {
//         let a = u256::from(10u32);
//         let b = u256::from(5u32);
//         assert_eq!(a / b, u256::from(2u32), "Division test failed");
//     }

//     // U256
//     #[test]
//     fn test_u256_from_str_radix() {
//         let v = U256::from
//         let u = U256::from_str_radix("1234567890", 10).unwrap();
//         u.to
//         assert_eq!(
//             u,
//             U256::from(1234567890u32),
//             "U256 from str radix test failed"
//         );
//     }
// }
