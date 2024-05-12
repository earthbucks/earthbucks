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
import {
  Link,
  json,
  redirect,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import PubKey from "earthbucks-lib/src/pub-key";
import PrivKey from "earthbucks-lib/src/priv-key";
import { $image } from "~/images";
import SigninChallenge from "earthbucks-lib/src/auth/signin-challenge";
import SigninResponse from "earthbucks-lib/src/auth/signin-response";
import { isValid } from "earthbucks-lib/src/iso-hex";
import { signin, signout } from "./api.auth.$method";
import { DOMAIN, DOMAIN_PUB_KEY_STR } from "~/.server/config";
import { getUserPubKey } from "~/.server/session";
import { $path } from "remix-routes";
import { twMerge } from "tailwind-merge";

export async function loader({ request }: LoaderFunctionArgs) {
  let userPubKey = await getUserPubKey(request);
  if (userPubKey) {
    return redirect($path("/home"));
  }

  return json({ DOMAIN, DOMAIN_PUB_KEY_STR });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in | EarthBucks Mine 1" },
    { name: "description", content: "Welcome to EarthBucks Mine 1!" },
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
    let isValidStrFmt = PrivKey.isValidIsoStr(keyStr);
    if (!isValidStrFmt) {
      return false;
    }
    let privKey = PrivKey.fromIsoStr(keyStr).unwrap();
    let pubKey = PubKey.fromPrivKey(privKey);
    return pubKey.toIsoStr() === publicKey;
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
      let res = await signin(
        DOMAIN,
        DOMAIN_PUB_KEY_STR,
        PrivKey.fromIsoStr(privateKey).unwrap(),
      );
      if (res) {
        window.location.href = $path("/home");
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return (
    <div className="mx-auto max-w-[400px]">
      <div className="my-4 text-center text-black dark:text-white">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="my-4">
          Please save your key pair in localStorage to sign in.
        </p>
        <p className="my-4 text-sm">
          New here?{" "}
          <Link to="/new" className="underline">
            Create a key pair first
          </Link>
          .
        </p>
      </div>
      <div className="my-4">
        <div className="relative my-2">
          <label htmlFor="public-key">
            <img
              src={$image("/sun-128.png")}
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
            onChange={(e) => {
              setPublicKey(e.target.value.trim());
              setIsPublicKeyValid(validatePublicKey(e.target.value.trim()));
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            value={publicKey}
            className={twMerge(
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
              src={$image("/black-button-128.png")}
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
            onChange={(e) => {
              setPrivateKey(e.target.value.trim());
              setIsPrivateKeyValid(validatePrivateKey(e.target.value.trim()));
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            value={privateKey}
            className={twMerge(
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
