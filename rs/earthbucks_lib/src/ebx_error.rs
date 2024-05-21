use std::{error::Error, fmt};

#[derive(Debug)]
pub enum EbxError {
    TooLittleDataError { source: Option<Box<dyn Error>> },
    TooMuchDataError { source: Option<Box<dyn Error>> },
    NonMinimalEncodingError { source: Option<Box<dyn Error>> },
    InsufficientPrecisionError { source: Option<Box<dyn Error>> },
    InvalidOpcodeError { source: Option<Box<dyn Error>> },
    InvalidHexError { source: Option<Box<dyn Error>> },
}

impl Error for EbxError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            EbxError::TooLittleDataError { source } => source.as_deref(),
            EbxError::TooMuchDataError { source } => source.as_deref(),
            EbxError::NonMinimalEncodingError { source } => source.as_deref(),
            EbxError::InsufficientPrecisionError { source } => source.as_deref(),
            EbxError::InvalidOpcodeError { source } => source.as_deref(),
            EbxError::InvalidHexError { source } => source.as_deref(),
        }
    }
}

impl fmt::Display for EbxError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            EbxError::TooLittleDataError { .. } => {
                write!(f, "not enough bytes in the buffer to read")
            }
            EbxError::TooMuchDataError { .. } => {
                write!(f, "too many bytes in the buffer to read")
            }
            EbxError::NonMinimalEncodingError { .. } => {
                write!(f, "non-minimal encoding")
            }
            EbxError::InsufficientPrecisionError { .. } => {
                write!(f, "number too large to retain precision")
            }
            EbxError::InvalidOpcodeError { .. } => {
                write!(f, "invalid opcode")
            }
            EbxError::InvalidHexError { .. } => {
                write!(f, "invalid hex")
            }
        }
    }
}
