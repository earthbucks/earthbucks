pub use num256::uint256::Uint256 as u256;

#[cfg(test)]
mod tests {
    use super::u256;
    use num256::uint256::Uint256;

    #[test]
    fn test_max_value() {
        let max_value = Uint256::from_be_bytes(&[255; 32]);
        let u = u256::from_be_bytes(&[255; 32]);
        assert_eq!(u, max_value, "Max value test failed");
    }

    #[test]
    fn test_beyond_max_value() {
        let u = u256::from_be_bytes(&[255; 32]);
        let result = u.checked_add(u256::from(1u32).to_be());
        assert!(result.is_none(), "Beyond max value test failed");
    }

    #[test]
    fn test_min_value() {
        let min_value = Uint256::from_be_bytes(&[0; 32]);
        let u = u256::from_be_bytes(&[0; 32]);
        assert_eq!(u, min_value, "Min value test failed");
    }

    #[test]
    fn test_addition() {
        let a = u256::from(5u32);
        let b = u256::from(10u32);
        assert_eq!(a + b, u256::from(15u32), "Addition test failed");
    }

    #[test]
    fn test_subtraction() {
        let a = u256::from(10u32);
        let b = u256::from(5u32);
        assert_eq!(a - b, u256::from(5u32), "Subtraction test failed");
    }

    #[test]
    fn test_multiplication() {
        let a = u256::from(5u32);
        let b = u256::from(10u32);
        assert_eq!(a * b, u256::from(50u32), "Multiplication test failed");
    }

    #[test]
    fn test_division() {
        let a = u256::from(10u32);
        let b = u256::from(5u32);
        assert_eq!(a / b, u256::from(2u32), "Division test failed");
    }
}
