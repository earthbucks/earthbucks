import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";
import Footer from "~/components/footer";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in | Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  return (
    <div className="mx-auto max-w-[400px]">
      <div className="my-4 text-black dark:text-white">
        <p>
          Please save your key pair in localStorage (client-side browser
          storage) to sign in. (New here? <Link to="/register" className='underline'>Register first</Link>.)
        </p>
      </div>
      <div className="my-4">
        <div className="my-2">
          <input
            type="text"
            placeholder="Public Key"
            className="w-full flex-grow overflow-hidden rounded-full border-[2px] border-gray-700 bg-white p-2 text-gray-600  dark:border-gray-300 dark:bg-black dark:text-gray-400"
          />
        </div>
        <div className="my-2">
          <input
            type="password"
            placeholder="Private Key"
            className="w-full flex-grow overflow-hidden rounded-full border-[2px] border-gray-700 bg-white p-2 text-gray-600  dark:border-gray-300 dark:bg-black dark:text-gray-400"
          />
        </div>
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Save" disabled />
      </div>
      <div className="mx-auto my-4 w-[320px]">
        <Button initialText="Sign in" mode="secret" disabled />
      </div>
    </div>
  );
}
