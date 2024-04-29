import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";
import Footer from "~/components/footer";

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/button-logo.png"
              alt=""
              className="mx-auto mb-4 block aspect-square w-[120px] rounded-full bg-[#020a2c] p-[1px] shadow-lg shadow-[#04408d]"
            />
            <div className="hidden dark:block">
              <img
                src="/compubutton-text-white.png"
                alt="Compubutton"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/compubutton-text-black.png"
                alt="Compubutton"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="mt-4 text-center text-black dark:text-white">
              Welcome to the most advanced button in the world!
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />

      <div className="mx-auto max-w-[400px]">
        <div className="mb-4 text-center text-black dark:text-white">
          Please insert your email address to register or log in.
        </div>
        <div className="mx-auto w-[320px]">
          <Button
            initialText="Verify email"
            successText="Solved!"
            mode="standard"
          />
        </div>
      </div>

      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
