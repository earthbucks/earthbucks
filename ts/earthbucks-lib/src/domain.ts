export class Domain {
  public domainStr: string;

  constructor(domainStr: string) {
    this.domainStr = domainStr;
  }

  static fromString(domainStr: string): Domain {
    return new Domain(domainStr);
  }

  toString(): string {
    return this.domainStr;
  }

  isValid(): boolean {
    return Domain.isValidDomain(this.domainStr);
  }

  static isValidDomain(domain: string): boolean {
    // our domain name validation is intentionally simpler, and different, than
    // real domain name validation. it is intended to be a simple check to
    // prevent common mistakes, not a full validation of a domain name.
    const domainStr = domain.trim();
    if (domainStr.length < 4) {
      return false;
    }
    if (domainStr.startsWith(".")) {
      return false;
    }
    if (domainStr.endsWith(".")) {
      return false;
    }
    if (!domainStr.includes(".")) {
      return false;
    }
    if (domainStr.includes("..")) {
      return false;
    }
    const domainParts = domainStr.split(".");
    if (domainParts.length < 2) {
      return false;
    }
    if (domainParts.length > 10) {
      return false;
    }
    if (domainParts.some((part) => part.length > 63)) {
      return false;
    }
    if (domainParts.some((part) => !part.match(/^[a-z0-9]+$/))) {
      return false;
    }
    return true;
  }

  static domainToBaseUrl(domain: string) {
    // enable "domain" to include a port number at the start if we are in
    // development, e.g. 4189.localhost goes to 4189.localhost:4189. otherwise,
    // assume https and no extra www (if they want www, they need to include that
    // in "domain")
    if (domain.includes("localhost")) {
      const possiblePort = Number.parseInt(String(domain.split(".")[0]));
      if (domain.endsWith("localhost") && possiblePort > 0) {
        return `http://${possiblePort}.localhost:${possiblePort}`;
      }
    }

    return `https://${domain}`;
  }
}
