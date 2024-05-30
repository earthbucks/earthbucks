pub trait Hex {
  fn to_hex(&self) -> String;
  fn from_hex(hex: &str) -> Result<Self, &'static str>
  where
      Self: Sized;
}

impl Hex for Vec<u8> {
  fn to_hex(&self) -> String {
      self.iter().fold(String::new(), |mut acc, &byte| {
          acc.push_str(&format!("{:02x}", byte));
          acc
      })
  }

  fn from_hex(hex: &str) -> Result<Self, &'static str> {
      if hex.len() % 2 != 0 {
          return Err("Hex string has an odd length");
      }

      let vec = (0..hex.len())
          .step_by(2)
          .map(|i| u8::from_str_radix(&hex[i..i + 2], 16))
          .collect::<Result<Vec<_>, _>>();

      match vec {
          Ok(v) => Ok(v),
          Err(_) => Err("Failed to convert hex string to Vec<u8>"),
      }
  }
}

impl<const N: usize> Hex for [u8; N] {
  fn to_hex(&self) -> String {
      self.iter().fold(String::new(), |mut acc, &byte| {
          acc.push_str(&format!("{:02x}", byte));
          acc
      })
  }

  fn from_hex(hex: &str) -> Result<Self, &'static str> {
      if hex.len() != N * 2 {
          return Err("Hex string has an incorrect length");
      }

      let vec = (0..hex.len())
          .step_by(2)
          .map(|i| u8::from_str_radix(&hex[i..i + 2], 16))
          .collect::<Result<Vec<_>, _>>();

      match vec {
          Ok(v) => {
              let array: Result<[u8; N], _> = v.try_into();
              match array {
                  Ok(a) => Ok(a),
                  Err(_) => Err("Failed to convert Vec<u8> to array"),
              }
          }
          Err(_) => Err("Failed to convert hex string to Vec<u8>"),
      }
  }
}