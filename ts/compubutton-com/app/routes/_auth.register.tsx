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

  return (
    <div className="mx-auto max-w-[400px]">
      <div className="mb-4 text-black dark:text-white">
        <p className="my-4">
          A new key pair has been generated client-side for you. Please save
          your key pair in your password manager to continue.
        </p>
        {keyPair ? (
          <div className="my-4">
            {keyPair.pubKey.toStringFmt()}
            <br />
            {keyPair.privKey.toStringFmt()}
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
