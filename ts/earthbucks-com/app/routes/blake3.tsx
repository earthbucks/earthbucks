import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { createHash, hash } from "blake3";
import { Buffer } from "buffer";

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function Landing() {
  if (typeof document === "undefined") {
    // running in a server environment
    const res = hash(Buffer.from("test"));
    console.log(res.toString("hex"));
  } else {
    // running in a browser environment
    import("blake3/browser").then(({ createHash, hash }) => {
      const res = hash(Buffer.from("test"));
      console.log(res.toString("hex"));
    });
  }
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/earthbucks-coin.png"
              alt=""
              className="mx-auto mb-4 block h-[200px] w-[200px] rounded-full bg-[#6d3206] shadow-lg shadow-[#6d3206]"
            />
            <div className="hidden dark:block">
              <img
                src="/earthbucks-text-white.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/earthbucks-text-black.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 mt-4 text-center text-black dark:text-white">
        42 trillion EBX. No pre-mine. GPUs. Big blocks. Script.
        <br />
        <br />
        Take the math test to register or log in.
      </div>
      <div className="mb-4 mt-4 h-[80px]">
        <div className="mx-auto w-[320px]">
          <Button initialText="Compute" />
        </div>
      </div>
    </div>
  );
}
