import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  async function onComputing() {
    console.log("begin");
    {
      console.time("blake3PowAsync");
      let nonce = blake3Sync(Buffer.from("nonce 5"));
      let target = Buffer.from(
        "00000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      let res = await blake3PowAsync(nonce, target);
      console.log(res.toString("hex"));
      let resHash = blake3Sync(res);
      console.log(resHash.toString("hex"));
      console.timeEnd("blake3PowAsync");
    }
    console.log("end");
  }
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
              Please solve the computcha to log in.
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 mt-4 h-[60px]">
        <div className="mx-auto w-[320px]">
          <Button
            initialText="Computcha"
            successText="Solved!"
            onComputing={onComputing}
            mode="computcha"
          />
        </div>
      </div>
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <div className="text-center text-black dark:text-white">
              Copyright &copy; 2024 Ryan X. Charles LLC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
