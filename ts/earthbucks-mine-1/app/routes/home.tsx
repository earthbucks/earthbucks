import type {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect, useLoaderData, useNavigate } from "@remix-run/react";
import Button from "~/components/button";
import Footer from "~/components/footer";
import { Buffer } from "buffer";
import { blake3PowAsync, blake3Sync } from "earthbucks-blake3/src/blake3-async";
import Header from "~/components/header";
import { signout } from "./api.auth.$method";
import PrivKey from "earthbucks-lib/src/priv-key";
import PubKey from "earthbucks-lib/src/pub-key";
import { getSession, getUserPubKey } from "~/.server/session";
import { DOMAIN, DOMAIN_PUB_KEY_STR } from "~/.server/config";
import { $path } from "remix-routes";
import { $image } from "~/images";

export async function loader({ request }: LoaderFunctionArgs) {
  let userPubKey = await getUserPubKey(request);
  if (!userPubKey) {
    return redirect("/signin");
  }

  return json({
    DOMAIN,
    DOMAIN_PUB_KEY_STR,
    userPubKeyStr: userPubKey.toIsoStr(),
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Home | EarthBucks Mine 1" },
    { name: "description", content: "Welcome to EarthBucks Mine 1!" },
  ];
};

export default function Landing() {
  const { DOMAIN, DOMAIN_PUB_KEY_STR, userPubKeyStr } =
    useLoaderData<typeof loader>();

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
          You are signed in as:
        </div>
        <div className="my-4">
          <div className="my-2 flex space-x-2">
            <div className="flex w-full flex-grow space-x-2 overflow-hidden rounded-full border-[3px] border-secondary-blue-500 p-2 text-gray-600 dark:text-gray-400">
              <img
                src={$image("/sun-128.png")}
                alt="Sun"
                className="h-[24px] w-[24px] shrink-0"
              />
              <div className="overflow-hidden overflow-ellipsis rounded-full">
                {userPubKeyStr}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto text-center">
          <button
            onClick={async () => {
              await signout(DOMAIN);
              navigate($path("/delete"));
            }}
            className="w-[100px] rounded-full border-[3px] border-button-blue-700 bg-button-blue-700 p-2 font-bold text-white hover:border-white hover:bg-primary-blue-500 hover:outline hover:outline-2 hover:outline-black hover:dark:border-white"
          >
            Sign out
          </button>
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
