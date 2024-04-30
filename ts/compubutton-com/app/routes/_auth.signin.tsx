import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";
import Footer from "~/components/footer";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in | Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  return (
    <div className="mx-auto max-w-[400px]">
      <div className="mb-4 text-center text-black dark:text-white">
        Please insert your public key and private key to sign in.
      </div>
      <div className="mx-auto w-[320px]">
        <Button initialText="Continue" disabled />
      </div>
    </div>
  );
}
