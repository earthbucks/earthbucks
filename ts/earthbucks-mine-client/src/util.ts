export function isValidUserName(userName: string): boolean {
  return (
    userName.length >= 3 &&
    userName.length <= 20 &&
    /^[a-z0-9]+$/.test(userName) &&
    /\D/.test(userName)
  );
}
