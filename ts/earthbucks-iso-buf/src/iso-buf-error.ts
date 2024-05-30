import { Result, Ok, Err } from "earthbucks-opt-res";
import { Option, Some, None } from "earthbucks-opt-res";

export abstract class IsoBufError extends Error {
  constructor() {
    super();
  }
}

export class GenericError extends IsoBufError {
  constructor(
    public source: Option<IsoBufError>,
    public message: string,
  ) {
    super();
  }

  toString(): string {
    return `isobuf error: ${this.message}`;
  }
}

export class NotEnoughDataError extends IsoBufError {
  constructor(public source: Option<IsoBufError>) {
    super();
  }

  toString(): string {
    return `not enough bytes in the buffer to read`;
  }
}

export class TooMuchDataError extends IsoBufError {
  constructor(public source: Option<IsoBufError>) {
    super();
  }

  toString(): string {
    return `too many bytes in the buffer to read`;
  }
}

export class NonMinimalEncodingError extends IsoBufError {
  constructor(public source: Option<IsoBufError>) {
    super();
  }

  toString(): string {
    return `non-minimal encoding`;
  }
}

export class InsufficientPrecisionError extends IsoBufError {
  constructor(public source: Option<IsoBufError>) {
    super();
  }

  toString(): string {
    return `number too large to retain precision`;
  }
}

export class InvalidHexError extends IsoBufError {
  constructor(public source: Option<IsoBufError>) {
    super();
  }

  toString(): string {
    return `invalid hex`;
  }
}

export class InvalidEncodingError extends IsoBufError {
  constructor(public source: Option<IsoBufError>) {
    super();
  }

  toString(): string {
    return `invalid encoding`;
  }
}
