export type Result<T = void, U = string> =
  | { result: T; error: null }
  | { result: null; error: U };

export function Ok<T = void, U = string>(result: T): Result<T, U> {
  return { result, error: null };
}

export function Err<T = void, U = string>(error: U): Result<T, U> {
  return { result: null, error };
}

export function isOk<T = void, U = string>(
  res: Result<T, U>,
): res is { result: T; error: null } {
  return res.error === null;
}

export function isErr<T = void, U = string>(
  res: Result<T, U>,
): res is { result: null; error: U } {
  return res.error !== null;
}

/**
 * asyncResult takes a promise resulting from an already-called function and
 * notices whether it is an error or a result, and then returns the appropriate
 * Result type.
 * */
export async function asyncResult<T = void>(
  promise: Promise<T>,
): Promise<Result<T, string>> {
  try {
    const result = await promise;
    return Ok(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Err(error.message);
    }
    return Err(`An unknown error occurred: ${error}`);
  }
}

/**
 * syncResult takes a function and arguments, calls the function with the
 * arguments, and notices whether it is an error or a result, and then returns
 * the appropriate Result type.
 */
// biome-ignore lint/suspicious/noExplicitAny: any is used to allow any function to be called
export function syncResult<T, Args extends any[]>(
  fn: (...args: Args) => T,
  ...args: Args
): Result<T, string> {
  try {
    const result = fn(...args);
    return Ok(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Err(error.message);
    }
    return Err(`An unknown error occurred: ${error}`);
  }
}
