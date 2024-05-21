import { Result, Ok, Err } from "./ts-results/result";
import { Option, Some, None } from "./ts-results/option";

export abstract class EbxError extends Error {
  constructor() {
    super();
  }
}

export class TooLittleDataError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `not enough bytes in the buffer to read`;
  }
}

export class TooMuchDataError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `too many bytes in the buffer to read`;
  }
}

export class NonMinimalEncodingError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `non-minimal encoding`;
  }
}

export class InsufficientPrecisionError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `number too large to retain precision`;
  }
}

export class InvalidOpcodeError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `invalid opcode`;
  }
}

export class InvalidHexError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `invalid hex`;
  }
}

export class InvalidEncodingError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `invalid encoding`;
  }
}

export class InvalidKeyError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `invalid key`;
  }
}

export class InvalidChecksumError extends EbxError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `invalid checksum`;
  }
}
