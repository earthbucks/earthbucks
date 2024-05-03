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
import Logo from "~/components/logo";
import Header from "~/components/header";

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
      <Header />
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <div className="mx-auto max-w-[400px]">
        <div className="my-4 text-center text-black dark:text-white">
          Please sign in or create a new key pair to continue.
        </div>
        <div className="mx-auto my-4 w-[320px]">
          <Button initialText="Sign in" onSuccess={onSignin} />
        </div>
        <div className="mx-auto my-4 w-[320px]">
          <Button initialText="New" onSuccess={onRegister} />
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
