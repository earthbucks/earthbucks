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
            className="w-full flex-grow overflow-hidden rounded-full border-[1px] border-gray-700 bg-white p-2 pl-[34px] text-gray-600 focus:outline focus:outline-2 focus:outline-primary-blue-500 dark:border-gray-300 dark:bg-black dark:text-gray-400"
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
            className="w-full flex-grow overflow-hidden rounded-full border-[1px] border-gray-700 bg-white p-2 pl-[34px] text-gray-600 focus:outline focus:outline-2 focus:outline-primary-blue-500 dark:border-gray-300 dark:bg-black dark:text-gray-400"
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
