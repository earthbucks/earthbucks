import Domain from "earthbucks-lib/src/domain";
import PrivKey from "earthbucks-lib/src/priv-key";
import PubKey from "earthbucks-lib/src/pub-key";

const DOMAIN_PRIV_KEY_STR: string = process.env.DOMAIN_PRIV_KEY || "";
const DOMAIN: string = process.env.DOMAIN || "";

let DOMAIN_PRIV_KEY: PrivKey;
let DOMAIN_PUB_KEY: PubKey;
try {
  DOMAIN_PRIV_KEY = PrivKey.fromStringFmt(DOMAIN_PRIV_KEY_STR);
  DOMAIN_PUB_KEY = PubKey.fromPrivKey(DOMAIN_PRIV_KEY);
} catch (err) {
  console.error(err);
  throw new Error("Invalid AUTH_PERMISSION_PRIV_KEY");
}

{
  let domainIsValid = Domain.isValidDomain(DOMAIN);
  if (!domainIsValid) {
    throw new Error("Invalid AUTH_DOMAIN_NAME");
  }
}

const DOMAIN_PUB_KEY_STR = DOMAIN_PUB_KEY.toStringFmt();

export { DOMAIN, DOMAIN_PRIV_KEY, DOMAIN_PUB_KEY, DOMAIN_PUB_KEY_STR };
