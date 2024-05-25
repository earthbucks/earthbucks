import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, useNavigate } from "@remix-run/react";
import Button from "~/components/button";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { $path } from "remix-routes";
import { getUserPubKey } from "~/.server/session";

export async function loader({ request }: LoaderFunctionArgs) {
  const userPubKey = await getUserPubKey(request);
  if (userPubKey) {
    return redirect($path("/home"));
  }
  return json({});
}

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks Mine 1" },
    { name: "description", content: "Welcome to EarthBucks Mine 1!" },
  ];
};

export default function Landing() {
  const navigate = useNavigate();

  async function onSignin() {
    navigate($path("/signin"));
  }

  async function onRegister() {
    navigate($path("/new"));
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
