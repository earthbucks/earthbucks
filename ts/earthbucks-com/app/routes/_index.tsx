import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Footer from "~/components/footer";
import Logo from "~/components/logo";

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function Index() {
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <Logo />
            <div className="my-4 hidden dark:block">
              <img
                src="/earthbucks-text-white.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="my-4 block dark:hidden">
              <img
                src="/earthbucks-text-black.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="mb-4 text-center text-black dark:text-white">
              Small casual transactions for everybody on Planet Earth.
              <br />
              <br />
              July 2024.
              <br />
              <br />
              <Link to="/blog" className="underline">
                Blog
              </Link>{" "}
              &middot;{" "}
              <a
                href="https://t.me/+e-PoBNNgdDU3MDUx"
                target="_blank"
                className="underline"
              >
                Telegram
              </a>{" "}
              &middot;{" "}
              <a
                href="https://discord.gg/dZfyrFk6uh"
                target="_blank"
                className="underline"
              >
                Discord
              </a>{" "}
              &middot;{" "}
              <a
                href="https://x.com/earthbucks_com"
                target="_blank"
                className="underline"
              >
                X (Twitter)
              </a>{" "}
              &middot;{" "}
              <a
                href="https://github.com/earthbucks/earthbucks"
                target="_blank"
                className="underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
