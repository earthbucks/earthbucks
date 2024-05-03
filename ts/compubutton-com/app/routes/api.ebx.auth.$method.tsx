import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, json, useFetcher } from "@remix-run/react";
// import {
//   createNewAuthSigninToken,
//   getAuthSigninToken,
// } from "earthbucks-db/src/models/auth-signin-token";
import PubKey from "earthbucks-lib/src/pub-key";
import SigninChallenge from "earthbucks-lib/src/auth/signin-challenge";
import SigninResponse from "earthbucks-lib/src/auth/signin-response";
import { DOMAIN, DOMAIN_PRIV_KEY, DOMAIN_PUB_KEY } from "../.server/config";
import PrivKey from "earthbucks-lib/src/priv-key";
import { z } from "zod";

const MethodSchema = z.enum(["new-signin-challenge", "new-signin-response"]);

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = MethodSchema.parse(params.method);
  switch (method) {
    case "new-signin-challenge":
      {
        const signinChallenge = SigninChallenge.fromRandom(
          DOMAIN_PRIV_KEY,
          DOMAIN,
        );
        return json({ signinChallenge: signinChallenge.toHex() });
      }
      break;

    case "new-signin-response":
      {
        const signinResponseHex = `${formData.get("signinReponse")}`;
        let signinResponse: SigninResponse;
        try {
          signinResponse = SigninResponse.fromHex(signinResponseHex, DOMAIN);
        } catch (err) {
          throw new Response("Invalid signin response 1", { status: 400 });
        }
        const signinChallengeBuf = signinResponse.signedMessage.message;
        let signinChallenge: SigninChallenge;
        try {
          signinChallenge = SigninChallenge.fromBuffer(
            signinChallengeBuf,
            DOMAIN,
          );
        } catch (err) {
          throw new Response("Invalid signin challenge 1", { status: 400 });
        }
        const isValidChallenge = signinChallenge.isValid(
          DOMAIN_PUB_KEY,
          DOMAIN,
        );
        if (!isValidChallenge) {
          throw new Response("Invalid signin challenge 2", { status: 400 });
        }
        let userPubKey: PubKey;
        try {
          userPubKey = PubKey.fromBuffer(signinResponse.signedMessage.pubKey);
        } catch (err) {
          throw new Response("Invalid user public key", { status: 400 });
        }
        let isValidResponse = signinResponse.isValid(userPubKey, DOMAIN);
        if (!isValidResponse) {
          throw new Response("Invalid signin response 2", { status: 400 });
        }
        return json({ isValidResponse });
      }
      break;

    // case "new-auth-signin-token":
    //   {
    //     const tokenId = await createNewAuthSigninToken();
    //     const token = await getAuthSigninToken(tokenId);
    //     return json({ tokenId: tokenId.toString("hex") });
    //   }
    //   break;

    default:
      {
        const _exhaustiveCheck: never = method;
        return _exhaustiveCheck;
      }
      break;
  }
}

function domainToBaseUrl(domain: string) {
  // enable "domain" to include a port number at the start if we are in
  // development, e.g. 3000.localhost goes to localhost:3000. otherwise, assume
  // https and no extra www (if they want www, they need to include that in
  // "domain")
  if (domain.includes("localhost")) {
    let possiblePort = parseInt(String(domain.split(".")[0]));
    if (domain.endsWith("localhost") && possiblePort > 0) {
      return `http://localhost:${possiblePort}`;
    }
  }

  return `https://${domain}`;
}

function methodPath(method: z.infer<typeof MethodSchema>) {
  return `/api/ebx/auth/${method}`;
}

export async function signin(
  DOMAIN: string,
  DOMAIN_PUB_KEY_STR: string,
  userPrivKey: PrivKey,
) {
  let baseUrl = domainToBaseUrl(DOMAIN);
  // get signin challenge
  let signinChallengeHex: string;
  {
    let formData = new FormData();
    let res = await fetch(`${baseUrl}${methodPath("new-signin-challenge")}`, {
      method: "POST",
      body: formData,
    });
    let json = await res.json();
    signinChallengeHex = json.signinChallenge;
    console.log(json);
  }
  {
    // verify signin challenge
    let signinChallenge = SigninChallenge.fromHex(signinChallengeHex, DOMAIN);
    let DOMAIN_PUB_KEY = PubKey.fromStringFmt(DOMAIN_PUB_KEY_STR);
    let isValidChallenge = signinChallenge.isValid(DOMAIN_PUB_KEY, DOMAIN);
    if (!isValidChallenge) {
      throw new Error("Invalid signin challenge");
    }

    // create signin response
    let signinResponse = SigninResponse.fromSigninChallenge(
      userPrivKey,
      DOMAIN,
      DOMAIN_PUB_KEY,
      signinChallenge,
    );

    // post signin response
    let formData = new FormData();
    formData.append("signinReponse", signinResponse.toHex());
    let res = await fetch(`${baseUrl}${methodPath("new-signin-response")}`, {
      method: "POST",
      body: formData,
    });
    let json = await res.json();
    console.log(json);
  }
  // {
  //   let formData = new FormData();
  //   formData.append("method", "new-auth-signin-token");
  //   let res = await fetch("/api/auth", {
  //     method: "POST",
  //     body: formData,
  //   });
  //   let json = await res.json();
  //   console.log(json);
  // }
}
