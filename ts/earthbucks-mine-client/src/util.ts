import { Domain } from "@earthbucks/lib";

/**
 * A valid user name must:
 *
 * - Be between 3 and 20 characters long
 * - Contain only lowercase letters and numbers
 * - Not be a number
 */
export function isValidUserName(userName: string): boolean {
  return (
    userName.length >= 3 &&
    userName.length <= 20 &&
    /^[a-z0-9]+$/.test(userName) &&
    /\D/.test(userName)
  );
}

/**
 * A valid user id must:
 * - Be a non-negative integer
 * - Be less than 2^53 - 1
 */
export function isValidUserId(userName: string): boolean {
  const nameInt = Number.parseInt(userName);
  if (nameInt.toString() !== userName) {
    return false;
  }
  if (nameInt <= 0) {
    return false;
  }
  const MAX_NUMBER = 2 ** 53 - 1;
  if (nameInt > MAX_NUMBER) {
    return false;
  }
  return true;
}

/**
 * A valid user name or id must:
 * - Be a valid user name or id
 */
export function isValidUserNameOrId(userNameOrId: string): boolean {
  return isValidUserName(userNameOrId) || isValidUserId(userNameOrId);
}

/**
 * A valid ebx address must:
 * - Be in the form of `userName@domain`
 * - Have a valid user name or id
 * - Have a valid domain
 */
export function isValidEbxAddress(ebxAddress: string): boolean {
  const parts = ebxAddress.split("@");
  if (parts.length !== 2) {
    return false;
  }
  const namePart = parts[0];
  const domainPart = parts[1];
  if (!namePart || !domainPart) {
    return false;
  }
  return (
    (isValidUserName(namePart) || isValidUserId(namePart)) &&
    Domain.isValidDomain(domainPart)
  );
}

/**
 * Get the parts of an ebx address (user name and domain as a tuple)
 */
export function getEbxAddressParts(ebxAddress: string): [string, string] {
  if (!isValidEbxAddress(ebxAddress)) {
    throw new Error("Invalid EBX address");
  }
  return ebxAddress.split("@") as [string, string];
}
