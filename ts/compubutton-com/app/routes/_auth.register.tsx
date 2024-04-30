import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import React, { useEffect, useState } from "react";
import KeyPair from "earthbucks-lib/src/key-pair";

export const meta: MetaFunction = () => {
  return [
    { title: "Register | Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);

  useEffect(() => {
    if (!keyPair) {
      let keyPair = KeyPair.fromRandom();
      setKeyPair(keyPair);
      console.log(keyPair?.privKey.toStringFmt());
    }
  }, []);

  const [copiedPub, setCopiedPub] = useState(false);
  const copyPubToClipboard = async () => {
    if (!keyPair) {
      return;
    }
    await navigator.clipboard.writeText(keyPair.pubKey.toStringFmt());
    setCopiedPub(true);
    setTimeout(() => setCopiedPub(false), 1000);
  };

  const [copiedPriv, setCopiedPriv] = useState(false);
  const copyPrivToClipboard = async () => {
    if (!keyPair) {
      return;
    }
    await navigator.clipboard.writeText(keyPair.privKey.toStringFmt());
    setCopiedPriv(true);
    setTimeout(() => setCopiedPriv(false), 1000);
  };

  return (
    <div className="mx-auto max-w-[400px]">
      <div className="mb-4 text-black dark:text-white">
        <p className="my-4">
          A new key pair has been generated client-side for you. Please save
          your key pair in your password manager to continue.
        </p>
        {keyPair ? (
          <div className="my-4">
            <div className="my-2 flex space-x-2">
              <div className="w-full flex-grow overflow-hidden rounded-full border-[2px] border-gray-700 p-2  text-gray-600 dark:border-gray-300 dark:text-gray-400">
                <div className="overflow-hidden rounded-full">
                  {keyPair.pubKey.toStringFmt()}
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={copyPubToClipboard}
                  className="bg-button-blue-700 border-button-blue-700 w-[100px] rounded-full border-[2px] p-2 font-bold text-white hover:border-white hover:outline hover:outline-2 hover:outline-black hover:dark:border-white"
                >
                  {copiedPub ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div className="my-2 flex space-x-2">
              <div className="w-full flex-grow overflow-hidden rounded-full border-[2px] border-gray-700 p-2  text-gray-600 dark:border-gray-300 dark:text-gray-400">
                <div className="overflow-hidden rounded-full">
                  (hidden)
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={copyPrivToClipboard}
                  className="bg-button-blue-700 border-button-blue-700 w-[100px] rounded-full border-[2px] p-2 font-bold text-white hover:border-white hover:outline hover:outline-2 hover:outline-black hover:dark:border-white"
                >
                  {copiedPriv ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <p className="my-4">
          Our servers have not seen and will never see your private key. If you
          lose your private key, it cannot be recovered. Never show your private
          key to anyone but Compubutton (client-side) and your password manager.
        </p>
      </div>
      <div className="mx-auto w-[320px]">
        <Button initialText="Log in" />
      </div>
    </div>
  );
}
