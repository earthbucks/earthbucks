import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, json, redirect, useNavigate } from "@remix-run/react";
import { $path } from "remix-routes";
import { getUserPubKey } from "~/.server/session";
import Button from "~/components/button";
import Footer from "~/components/footer";
import Logo from "~/components/logo";
import { $image } from "~/images";

export async function loader({ request }: LoaderFunctionArgs) {
  const userPubKey = await getUserPubKey(request);
  if (userPubKey) {
    return redirect($path("/home"));
  }
  return json({});
}

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  async function onSignin() {
    navigate($path("/signin"));
  }

  async function onRegister() {
    navigate($path("/new"));
  }
  return (
    <div>
      <div className="mx-auto my-4">
        <Logo />
        <div className="my-4 hidden dark:block">
          <img
            src={$image("/images/earthbucks-text-white.png")}
            alt="EarthBucks"
            className="mx-auto block w-[250px]"
          />
        </div>
        <div className="my-4 block dark:hidden">
          <img
            src={$image("/images/earthbucks-text-black.png")}
            alt="EarthBucks"
            className="mx-auto block w-[250px]"
          />
        </div>
        <div className="mb-4 text-center text-black dark:text-white">
          A social network for everybody on Planet Earth.
        </div>
      </div>
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
