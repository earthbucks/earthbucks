use std::{error::Error, fmt};

#[derive(Debug)]
pub enum EbxError {
    InsufficientLengthError { source: Option<Box<dyn Error>> },
    NonMinimalEncodingError { source: Option<Box<dyn Error>> },
}

impl Error for EbxError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            EbxError::InsufficientLengthError { source } => source.as_deref(),
            EbxError::NonMinimalEncodingError { source } => source.as_deref(),
        }
    }
}

impl fmt::Display for EbxError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            EbxError::InsufficientLengthError { .. } => {
                write!(f, "not enough bytes in the buffer to read")
            }
            EbxError::NonMinimalEncodingError { .. } => {
                write!(f, "non-minimal varint encoding")
            }
        }
    }
}
