import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, json, redirect, useFetcher } from "@remix-run/react";
import PubKey from "earthbucks-lib/src/pub-key";
import SigninChallenge from "earthbucks-lib/src/auth/signin-challenge";
import SigninResponse from "earthbucks-lib/src/auth/signin-response";
import { DOMAIN, DOMAIN_PRIV_KEY, DOMAIN_PUB_KEY } from "../.server/config";
import PrivKey from "earthbucks-lib/src/priv-key";
import { z } from "zod";
import { commitSession, getSession, destroySession } from "../.server/session";
import { $path } from "remix-routes";

const MethodSchema = z.enum([
  "get-signin-challenge",
  "post-signin-response",
  "signout",
]);

export type SearchParams = {
  method: z.infer<typeof MethodSchema>;
};

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [property: string]: JsonValue };
type JsonArray = JsonValue[];

function isPlainObject(value: any): value is JsonObject {
  return (
    typeof value === "object" && // Ensures value is an object
    value !== null && // Ensures value is not null
    value.constructor === Object && // Ensures value was constructed by Object
    Object.getPrototypeOf(value) === Object.prototype // Ensures value's prototype is Object.prototype
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  let inputData: JsonObject;
  try {
    let res = await request.json();
    if (!isPlainObject(res)) {
      throw new Response("Invalid JSON Object", { status: 400 });
    }
    inputData = res;
  } catch (err) {
    throw new Response("Invalid JSON Object", { status: 400 });
  }

  const method = MethodSchema.parse(params.method);
  switch (method) {
    case "get-signin-challenge":
      {
        const signinChallenge = SigninChallenge.fromRandom(
          DOMAIN_PRIV_KEY,
          DOMAIN,
        );
        return json({ signinChallenge: signinChallenge.toIsoHex() });
      }
      break;

    case "post-signin-response":
      {
        const signinResponseHex = `${inputData.signinReponse}`;
        let signinResponse: SigninResponse;
        try {
          signinResponse = SigninResponse.fromIsoHex(signinResponseHex, DOMAIN);
        } catch (err) {
          throw new Response("Invalid signin response 1", { status: 400 });
        }
        const signinChallengeBuf = signinResponse.signedMessage.message;
        let signinChallenge: SigninChallenge;
        try {
          signinChallenge = SigninChallenge.fromIsoBuf(
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
          userPubKey = PubKey.fromIsoBuf(
            signinResponse.signedMessage.pubKey,
          ).unwrap();
        } catch (err) {
          throw new Response("Invalid user public key", { status: 400 });
        }
        let isValidResponse = signinResponse.isValid(userPubKey, DOMAIN);
        if (!isValidResponse) {
          throw new Response("Invalid signin response 2", { status: 400 });
        }

        // create session
        let session = await getSession(request.headers.get("Cookie"));
        session.set("pubKey", userPubKey);

        // Login succeeded
        return json(
          { ok: true },
          {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          },
        );
      }
      break;

    case "signout": {
      let session = await getSession(request.headers.get("Cookie"));
      return json(
        { ok: true },
        {
          headers: {
            "Set-Cookie": await destroySession(session),
          },
        },
      );
    }

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
  return $path(`/api/auth/:method`, { method });
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
    let res = await fetch(`${baseUrl}${methodPath("get-signin-challenge")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    let json = await res.json();
    signinChallengeHex = json.signinChallenge;
    console.log(json);
  }
  {
    // verify signin challenge
    let signinChallenge = SigninChallenge.fromIsoHex(
      signinChallengeHex,
      DOMAIN,
    );
    let DOMAIN_PUB_KEY = PubKey.fromIsoStr(DOMAIN_PUB_KEY_STR).unwrap();
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
    let res = await fetch(`${baseUrl}${methodPath("post-signin-response")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signinReponse: signinResponse.toIsoHex(),
      }),
    });
    let json = await res.json();
    console.log(json);

    if (!json.ok) {
      throw new Error("Invalid signin response");
    }

    return true;
  }
}

export async function signout(DOMAIN: string) {
  let baseUrl = domainToBaseUrl(DOMAIN);
  let res = await fetch(`${baseUrl}${methodPath("signout")}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  let json = await res.json();
  console.log(json);
  return json.ok;
}
