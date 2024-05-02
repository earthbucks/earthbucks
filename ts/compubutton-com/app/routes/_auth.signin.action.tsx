import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, json, useFetcher } from "@remix-run/react";
import {
  createNewAuthSigninToken,
  getAuthSigninToken,
} from "earthbucks-db/src/models/auth-signin-token";
import PrivKey from "earthbucks-lib/src/priv-key";
import PubKey from "earthbucks-lib/src/pub-key";
import Domain from "earthbucks-lib/src/domain";
import SigninChallenge from "earthbucks-lib/src/auth/signin-challenge";

const DOMAIN_PRIV_KEY_STR: string = process.env.DOMAIN_PRIV_KEY || "";
const DOMAIN: string = process.env.DOMAIN || "";

let AUTH_PRIV_KEY: PrivKey;
let AUTH_PUB_KEY: PubKey;
try {
  AUTH_PRIV_KEY = PrivKey.fromStringFmt(DOMAIN_PRIV_KEY_STR);
  AUTH_PUB_KEY = PubKey.fromPrivKey(AUTH_PRIV_KEY);
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

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = `${formData.get("method")}`;
  if (method === "new-permission-token") {
    const signedPermissionToken = SigninChallenge.fromRandom(
      AUTH_PRIV_KEY,
      DOMAIN,
    );
    return json({ signedPermissionToken: signedPermissionToken.toHex() });
  } else if (method === "new-auth-signin-token") {
    const tokenId = await createNewAuthSigninToken();
    console.log(tokenId.toString("hex"));
    const token = await getAuthSigninToken(tokenId);
    console.log(token?.id.toString("hex"));
    console.log(token);
    return json({ tokenId: tokenId.toString("hex") });
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
}
