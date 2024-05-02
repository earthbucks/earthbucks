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

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  const navigate = useNavigate();

  async function onSignin() {
    navigate("/signin");
  }

  async function onRegister() {
    navigate("/new");
  }

  return (
    <div className="">
      <div className="mt-4 flex">
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
      <Footer />
    </div>
  );
}
