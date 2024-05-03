import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import React, { useEffect, useState } from "react";
import KeyPair from "earthbucks-lib/src/key-pair";
import { useNavigate } from "@remix-run/react";
import { Buffer } from "buffer";

export const meta: MetaFunction = () => {
  return [
    { title: "New | Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Register() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);

  async function generateKeyPair() {
    let keyPair = KeyPair.fromRandom();
    setKeyPair(keyPair);
  }

  const [copiedPub, setCopiedPub] = useState(false);
  const copyPubToClipboard = async () => {
    if (!keyPair) {
      return;
    }
    await navigator.clipboard.writeText(keyPair.pubKey.toStringFmt());
    setCopiedPub(true);
    setTimeout(() => setCopiedPub(false), 1000);
  };

  const [copiedPrv, setCopiedPrv] = useState(false);
  const copyPrvToClipboard = async () => {
    if (!keyPair) {
      return;
    }
    await navigator.clipboard.writeText(keyPair.privKey.toStringFmt());
    setCopiedPrv(true);
    setTimeout(() => setCopiedPrv(false), 1000);
  };

  let navigate = useNavigate();
  const onSignin = async () => {
    navigate("/signin");
  };

  return (
    <div className="mx-auto max-w-[400px]">
      {!keyPair ? (
        <div className="my-4 text-center text-black dark:text-white">
          <h1 className="text-2xl font-bold">New</h1>
          <p className="my-4">Please generate a new key pair to sign in.</p>
          <div className="mx-auto w-[320px]">
            <Button initialText="Generate" onComputing={generateKeyPair} />
          </div>
        </div>
      ) : null}
      {keyPair ? (
        <div>
          <div className="my-4 text-black dark:text-white">
            <p className="my-4">
              A new key pair has been generated client-side for you. Please save
              your key pair in your password manager to continue.
            </p>
            <div className="my-4">
              <div className="my-2 flex space-x-2">
                <div className="flex w-full flex-grow space-x-2 overflow-hidden rounded-full border-[3px] border-secondary-blue-500 p-2 text-gray-600 dark:text-gray-400">
                  <img
                    src="/sun-128.png"
                    alt="Sun"
                    className="h-[24px] w-[24px] shrink-0"
                  />
                  <div className="overflow-hidden overflow-ellipsis rounded-full">
                    {keyPair.pubKey.toStringFmt()}
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
                    src="/black-button-128.png"
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
            <p className="my-4">
              Our servers have not seen and will never see your private key. If
              you lose your private key, it cannot be recovered. Never show your
              private key to anyone but Compubutton (client-side) and your
              password manager.
            </p>
          </div>
          <div className="mx-auto w-[320px]">
            <Button initialText="Sign in" onComputing={onSignin} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
