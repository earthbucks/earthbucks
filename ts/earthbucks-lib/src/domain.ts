import { Buffer } from "buffer";

export default class Domain {
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

  static isValidDomain(domainStr: string): boolean {
    domainStr = domainStr.trim();
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
    if (domainParts.some((part) => part.startsWith("-"))) {
      return false;
    }
    if (domainParts.some((part) => part.endsWith("-"))) {
      return false;
    }
    if (domainParts.some((part) => part.includes("--"))) {
      return false;
    }
    return true;
  }
}
