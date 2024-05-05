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
import { $image, classNames } from "~/util";
import SigninChallenge from "earthbucks-lib/src/auth/signin-challenge";
import SigninResponse from "earthbucks-lib/src/auth/signin-response";
import { isValid } from "earthbucks-lib/src/strict-hex";
import { signin, signout } from "./api.auth.$method";
import { DOMAIN, DOMAIN_PUB_KEY_STR } from "~/.server/config";
import { getUserPubKey } from "~/.server/session";
import { $path } from "remix-routes";

export async function loader({ request }: LoaderFunctionArgs) {
  let userPubKey = await getUserPubKey(request);
  if (userPubKey) {
    return redirect($path("/home"));
  }

  return json({ DOMAIN, DOMAIN_PUB_KEY_STR });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Delete | EarthBucks Mine 1" },
    { name: "description", content: "Welcome to EarthBucks Mine 1!" },
  ];
};

export default function Delete() {
  const { DOMAIN, DOMAIN_PUB_KEY_STR } = useLoaderData<typeof loader>();

  const [publicKey, setPublicKey] = useState("");
  const [isPublicKeyValid, setIsPublicKeyValid] = useState<boolean | null>(
    null,
  );
  const [privateKey, setPrivateKey] = useState("");
  const [isPrivateKeyValid, setIsPrivateKeyValid] = useState<boolean | null>(
    null,
  );

  const [copiedPub, setCopiedPub] = useState(false);
  const copyPubToClipboard = async () => {
    if (!publicKey) {
      return;
    }
    await navigator.clipboard.writeText(publicKey);
    setCopiedPub(true);
    setTimeout(() => setCopiedPub(false), 1000);
  };

  const [copiedPrv, setCopiedPrv] = useState(false);
  const copyPrvToClipboard = async () => {
    if (!privateKey) {
      return;
    }
    await navigator.clipboard.writeText(privateKey);
    setCopiedPrv(true);
    setTimeout(() => setCopiedPrv(false), 1000);
  };

  async function deleteKeysFromLocalStorage() {
    localStorage.removeItem("privKey");
    localStorage.removeItem("pubKey");
    setPrivateKey("");
    setPublicKey("");
    window.location.href = $path("/");
  }

  useEffect(() => {
    let privKey = localStorage.getItem("privKey");
    let pubKey = localStorage.getItem("pubKey");
    if (privKey && pubKey) {
      setPrivateKey(privKey);
      setPublicKey(pubKey);
      setIsPublicKeyValid(true);
      setIsPrivateKeyValid(true);
    } else {
      window.location.href = $path("/");
    }
  }, []);

  return (
    <div className="mx-auto max-w-[400px]">
      <div className="my-4 text-black dark:text-white">
        <h1 className="text-center text-2xl font-bold">Delete</h1>
        <p className="my-4 text-left">
          You have been signed out. Please delete your keys from localStorage.
          Confirm that you have saved them to your password manager first.
        </p>
      </div>
      <div className="my-4">
        <div className="my-2 flex space-x-2">
          <div className="flex w-full flex-grow space-x-2 overflow-hidden rounded-full border-[3px] border-secondary-blue-500 p-2 text-gray-600 dark:text-gray-400">
            <img
              src={$image("/sun-128.png")}
              alt="Sun"
              className="h-[24px] w-[24px] shrink-0"
            />
            <div className="overflow-hidden overflow-ellipsis rounded-full">
              {publicKey}
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={copyPubToClipboard}
              className="w-[100px] rounded-full border-[3px] border-button-blue-700 bg-button-blue-700 p-2 font-bold text-white hover:border-white hover:bg-primary-blue-500 hover:outline hover:outline-2 hover:outline-black hover:dark:border-white"
            >
              {copiedPub ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div className="my-2 flex space-x-2">
          <div className="flex w-full flex-grow space-x-2 overflow-hidden rounded-full border-[3px] border-secondary-blue-500 p-2 text-gray-600 dark:text-gray-400">
            <img
              src={$image("/black-button-128.png")}
              alt="Sun"
              className="h-[24px] w-[24px] shrink-0"
            />
            <div className="overflow-hidden rounded-full">
              (private key hidden)
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={copyPrvToClipboard}
              className="w-[100px] rounded-full border-[3px] border-button-blue-700 bg-button-blue-700 p-2 font-bold text-white hover:border-white hover:bg-primary-blue-500 hover:outline hover:outline-2 hover:outline-black hover:dark:border-white"
            >
              {copiedPrv ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button
          initialText="Delete"
          computingText="Deleting..."
          successText="Deleted!"
          disabled={!isPrivateKeyValid || !isPublicKeyValid}
          onComputing={deleteKeysFromLocalStorage}
        />
      </div>
    </div>
  );
}
