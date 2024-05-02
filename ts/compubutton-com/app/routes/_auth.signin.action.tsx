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
import SigninResponse from "earthbucks-lib/src/auth/signin-response";

const DOMAIN_PRIV_KEY_STR: string = process.env.DOMAIN_PRIV_KEY || "";
const DOMAIN: string = process.env.DOMAIN || "";

let DOMAIN_PRIV_KEY: PrivKey;
let AUTH_PUB_KEY: PubKey;
try {
  DOMAIN_PRIV_KEY = PrivKey.fromStringFmt(DOMAIN_PRIV_KEY_STR);
  AUTH_PUB_KEY = PubKey.fromPrivKey(DOMAIN_PRIV_KEY);
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
  if (method === "new-signin-challenge") {
    const signinChallenge = SigninChallenge.fromRandom(DOMAIN_PRIV_KEY, DOMAIN);
    return json({ signinChallenge: signinChallenge.toHex() });
  } else if (method == 'new-signin-response') {
    const signinReponseHex = `${formData.get("signinReponse")}`;
    let signinResponse: SigninResponse 
    try {
      signinResponse = SigninResponse.fromHex(signinReponseHex, DOMAIN);
    } catch (err) {
      throw new Response("Invalid signin response 1", { status: 400 });
    }
    const signinChallengeBuf = signinResponse.signedMessage.message;
    let signinChallenge: SigninChallenge
    try {
      signinChallenge = SigninChallenge.fromBuffer(signinChallengeBuf, DOMAIN);
    } catch (err) {
      throw new Response("Invalid signin challenge 1", { status: 400 });
    }
    const isValidChallenge = signinChallenge.isValid(AUTH_PUB_KEY, DOMAIN);
    if (!isValidChallenge) {
      throw new Response("Invalid signin challenge 2", { status: 400 });
    }
    let isValidResponse = signinResponse.isValid(DOMAIN_PRIV_KEY, DOMAIN);
    if (!isValidResponse) {
      console.log('here')
      throw new Response("Invalid signin response 2", { status: 400 });
    }
    return json({ isValidResponse });
  } else if (method === "new-auth-signin-token") {
    const tokenId = await createNewAuthSigninToken();
    const token = await getAuthSigninToken(tokenId);
    return json({ tokenId: tokenId.toString("hex") });
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
}
