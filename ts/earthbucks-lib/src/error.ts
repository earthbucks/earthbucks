export abstract class EbxError extends Error {}

export class GenericError extends EbxError {
  public message: string;
  public source?: EbxError;
  constructor(message?: string, source?: EbxError) {
    super();
    this.message = message || "";
    this.source = source;
  }

  toString(): string {
    const errStr = "ebx error";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class VerificationError extends GenericError {
  toString(): string {
    const errStr = "verification error";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class HeaderVerificationError extends VerificationError {
  toString(): string {
    const errStr = "header verification error";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class BlockVerificationError extends VerificationError {
  toString(): string {
    const errStr = "block verification error";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class TxVerificationError extends VerificationError {
  toString(): string {
    const errStr = "tx verification error";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class ScriptVerificationError extends VerificationError {
  toString(): string {
    const errStr = "script verification error";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class InvalidSizeError extends GenericError {
  toString(): string {
    const errStr = "invalid size error";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class NotEnoughDataError extends GenericError {
  toString(): string {
    const errStr = "not enough bytes in the buffer to read";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class TooMuchDataError extends GenericError {
  toString(): string {
    const errStr = "too many bytes in the buffer to read";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class NonMinimalEncodingError extends GenericError {
  toString(): string {
    const errStr = "non-minimal encoding";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class InsufficientPrecisionError extends GenericError {
  toString(): string {
    const errStr = "number too large to retain precision";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class InvalidOpcodeError extends GenericError {
  toString(): string {
    const errStr = "invalid opcode";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class InvalidHexError extends GenericError {
  toString(): string {
    const errStr = "invalid hex";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class InvalidEncodingError extends GenericError {
  toString(): string {
    const errStr = "invalid encoding";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class InvalidKeyError extends GenericError {
  toString(): string {
    const errStr = "invalid key";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}

export class InvalidChecksumError extends GenericError {
  toString(): string {
    const errStr = "invalid checksum";
    if (this.message) {
      if (this.source) {
        return `${errStr}: ${this.message}: ${this.source.toString()}`;
      }
      return `${errStr}: ${this.message}`;
    }
    return `${errStr}`;
  }
}
