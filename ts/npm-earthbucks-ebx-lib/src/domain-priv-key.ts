import { Domain } from "./domain.js";
import { PrivKey } from "./priv-key.js";

export class DomainPrivKey {
  domain: string;
  privKey: PrivKey;

  constructor(domain: string, privKey: PrivKey) {
    this.domain = domain;
    this.privKey = privKey;
  }

  static fromRandom(domain: string) {
    return new DomainPrivKey(domain, PrivKey.fromRandom());
  }

  toString() {
    return `${this.domain}:${this.privKey.toString()}`;
  }

  static fromString(str: string) {
    const [domain, privKey] = str.split(":");
    if (!domain || !privKey) {
      throw new Error("Invalid domain private key string");
    }
    if (!Domain.isValidDomain(domain)) {
      throw new Error("Invalid domain");
    }
    return new DomainPrivKey(domain, PrivKey.fromString(privKey));
  }
}
