import type {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import Button from "../button";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";
import Footer from "~/components/footer";
import { Link, json, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import PubKey from "earthbucks-lib/src/pub-key";
import PrivKey from "earthbucks-lib/src/priv-key";
import { classNames } from "~/util";
import SigninChallenge from "earthbucks-lib/src/auth/signin-challenge";
import SigninResponse from "earthbucks-lib/src/auth/signin-response";
import { isValid } from "earthbucks-lib/src/strict-hex";

export async function loader({ request }: LoaderFunctionArgs) {
  const DOMAIN = process.env.DOMAIN || "";
  const DOMAIN_PRIV_KEY_STR = process.env.DOMAIN_PRIV_KEY || "";
  const DOMAIN_PRIV_KEY = PrivKey.fromStringFmt(DOMAIN_PRIV_KEY_STR);
  const DOMAIN_PUB_KEY = PubKey.fromPrivKey(DOMAIN_PRIV_KEY);
  const DOMAIN_PUB_KEY_STR = DOMAIN_PUB_KEY.toStringFmt();
  return json({ DOMAIN, DOMAIN_PUB_KEY_STR });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in | Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Signin() {
  const { DOMAIN, DOMAIN_PUB_KEY_STR } = useLoaderData<typeof loader>();

  const [publicKey, setPublicKey] = useState("");
  const [isPublicKeyValid, setIsPublicKeyValid] = useState<boolean | null>(
    null,
  );
  const [privateKey, setPrivateKey] = useState("");
  const [isPrivateKeyValid, setIsPrivateKeyValid] = useState<boolean | null>(
    null,
  );

  const validatePublicKey = (keyStr: string) => {
    return PubKey.isValidStringFmt(keyStr);
  };

  const validatePrivateKey = (keyStr: string) => {
    let isValidStrFmt = PrivKey.isValidStringFmt(keyStr);
    if (!isValidStrFmt) {
      return false;
    }
    let privKey = PrivKey.fromStringFmt(keyStr);
    let pubKey = PubKey.fromPrivKey(privKey);
    return pubKey.toStringFmt() === publicKey;
  };

  const [isSaved, setIsSaved] = useState(false);
  async function saveToLocalStorage() {
    localStorage.setItem("privKey", privateKey);
    localStorage.setItem("pubKey", publicKey);
    setIsSaved(true);
  }

  useEffect(() => {
    let privKey = localStorage.getItem("privKey");
    let pubKey = localStorage.getItem("pubKey");
    if (privKey && pubKey) {
      setPrivateKey(privKey);
      setPublicKey(pubKey);
      setIsPublicKeyValid(true);
      setIsPrivateKeyValid(true);
    }
  }, []);

  async function onSignin() {
    try {
      // get signin challenge
      let signinChallengeHex: string;
      {
        let formData = new FormData();
        formData.append("method", "new-signin-challenge");
        let res = await fetch("/api/auth", {
          method: "POST",
          body: formData,
        });
        let json = await res.json();
        signinChallengeHex = json.signinChallenge;
        console.log(json);
      }
      {
        // verify signin challenge
        let signinChallenge = SigninChallenge.fromHex(
          signinChallengeHex,
          DOMAIN,
        );
        let DOMAIN_PUB_KEY = PubKey.fromStringFmt(DOMAIN_PUB_KEY_STR);
        let isValidChallenge = signinChallenge.isValid(DOMAIN_PUB_KEY, DOMAIN);
        if (!isValidChallenge) {
          throw new Error("Invalid signin challenge");
        }

        // create signin response
        let userPrivKey = PrivKey.fromStringFmt(privateKey);
        let signinResponse = SigninResponse.fromSigninChallenge(
          userPrivKey,
          DOMAIN,
          DOMAIN_PUB_KEY,
          signinChallenge,
        );
        console.log(signinResponse.toHex());

        // post signin response
        let formData = new FormData();
        formData.append("method", "new-signin-response");
        formData.append("signinReponse", signinResponse.toHex());
        let res = await fetch("/api/auth", {
          method: "POST",
          body: formData,
        });
        let json = await res.json();
        console.log(json);
      }
      {
        let formData = new FormData();
        formData.append("method", "new-auth-signin-token");
        let res = await fetch("/api/auth", {
          method: "POST",
          body: formData,
        });
        let json = await res.json();
        console.log(json);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mx-auto max-w-[400px]">
      <div className="my-4 text-black dark:text-white">
        <p>
          Please save your key pair in localStorage (client-side browser
          storage) to sign in. (New here?{" "}
          <Link to="/register" className="underline">
            Register first
          </Link>
          .)
        </p>
      </div>
      <div className="my-4">
        <div className="relative my-2">
          <label htmlFor="public-key">
            <img
              src="/sun-128.png"
              alt="Sun"
              draggable="false"
              className="absolute left-[9px] top-[9px] h-[24px] w-[24px]"
            />
          </label>
          <input
            id="public-key"
            type="text"
            placeholder="Public Key"
            disabled={isSaved}
            onChange={(e) => setPublicKey(e.target.value.trim())}
            onBlur={() => {
              if (publicKey !== "") {
                setIsPublicKeyValid(validatePublicKey(publicKey));
              } else {
                setIsPublicKeyValid(null);
              }
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            value={publicKey}
            className={classNames(
              "w-full flex-grow overflow-hidden rounded-full border-[1px] bg-white p-2 pl-[36px] text-gray-600 focus:border-primary-blue-500 focus:outline focus:outline-2 focus:outline-primary-blue-500 dark:bg-black dark:text-gray-400",
              isPublicKeyValid === null
                ? "border-gray-700 dark:border-gray-300"
                : isPublicKeyValid
                  ? "border-secondary-blue-500 outline outline-2 outline-secondary-blue-500"
                  : "border-red-500 outline outline-2 outline-red-500",
            )}
          />
        </div>
        <div className="relative my-2">
          <label htmlFor="private-key">
            <img
              src="/black-button-128.png"
              alt="Sun"
              draggable="false"
              className="absolute left-[9px] top-[9px] h-[24px] w-[24px]"
            />
          </label>
          <input
            type="password"
            id="private-key"
            placeholder="Private Key"
            disabled={isSaved}
            onChange={(e) => setPrivateKey(e.target.value.trim())}
            onBlur={() => {
              if (privateKey !== "") {
                setIsPrivateKeyValid(validatePrivateKey(privateKey));
              } else {
                setIsPrivateKeyValid(null);
              }
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            value={privateKey}
            className={classNames(
              "w-full flex-grow overflow-hidden rounded-full border-[1px] bg-white p-2 pl-[36px] text-gray-600 focus:border-primary-blue-500 focus:outline focus:outline-2 focus:outline-primary-blue-500 dark:bg-black dark:text-gray-400",
              isPrivateKeyValid === null
                ? "border-gray-700 dark:border-gray-300"
                : isPrivateKeyValid
                  ? "border-secondary-blue-500 outline outline-2 outline-secondary-blue-500"
                  : "border-red-500 outline outline-2 outline-red-500",
            )}
          />
        </div>
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button
          key={"save-disabled"}
          initialText="Save"
          computingText="Saving..."
          successText="Saved!"
          disabled={!isPrivateKeyValid || !isPublicKeyValid}
          onComputing={saveToLocalStorage}
        />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button
          initialText="Sign in"
          mode="secret"
          disabled={!isSaved}
          onComputing={onSignin}
        />
      </div>
    </div>
  );
}
