import { PubKey } from "./pub-key.js";
import { DomainPrivKey } from "./domain-priv-key.js";
import { Domain } from "./domain.js";

export class DomainPubKey {
  domain: string;
  pubKey: PubKey;

  constructor(domain: string, pubKey: PubKey) {
    this.domain = domain;
    this.pubKey = pubKey;
  }

  static fromDomainPrivKey(domainPrivKey: DomainPrivKey) {
    const pubKey = PubKey.fromPrivKey(domainPrivKey.privKey);
    return new DomainPubKey(domainPrivKey.domain, pubKey);
  }

  toString() {
    return `${this.domain}:${this.pubKey.toString()}`;
  }

  static fromString(str: string) {
    const [domain, pubKey] = str.split(":");
    if (!domain || !pubKey) {
      throw new Error("Invalid domain public key string");
    }
    if (!Domain.isValidDomain(domain)) {
      throw new Error("Invalid domain");
    }
    return new DomainPubKey(domain, PubKey.fromString(pubKey));
  }
}
