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
import Header from "~/components/header";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | Compubutton" },
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
      <Header />
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <div className="mx-auto max-w-[400px]">
        <div className="my-4 text-center text-black dark:text-white">
          You are signed in as:
          <br />
          (public key)
        </div>

        <div className="mx-auto text-center">
          <button className="w-[100px] rounded-full border-[3px] border-button-blue-700 bg-button-blue-700 p-2 font-bold text-white hover:border-white hover:bg-primary-blue-500 hover:outline hover:outline-2 hover:outline-black hover:dark:border-white">
            Sign out
          </button>
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
