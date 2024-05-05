import type {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import Button from "~/button";
import Footer from "~/components/footer";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";
import { $path } from "remix-routes";
import { $image } from "~/util";

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  const navigate = useNavigate();

  async function onSuccess() {
    navigate($path("/signin"));
  }

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
      <div className="mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src={$image("/button-logo.png")}
              alt=""
              className="mx-auto mb-4 block aspect-square w-[120px] rounded-full bg-[#020a2c] p-[1px] shadow-lg shadow-[#04408d]"
            />
            <div className="hidden dark:block">
              <img
                src={$image("/compubutton-text-white.png")}
                alt="Compubutton"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src={$image("/compubutton-text-black.png")}
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
          Please sign in or register to continue.
        </div>
        <div className="mx-auto w-[320px]">
          <Button
            initialText="Computcha"
            computingText="Computing..."
            successText="Solved!"
            mode="computcha"
            onComputing={onComputing}
            onSuccess={onSuccess}
          />
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
