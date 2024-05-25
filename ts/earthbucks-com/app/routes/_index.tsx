import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { $path } from "remix-routes";
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
    <div>
      <div className="mx-auto my-4">
        <Logo />
        <div className="my-4 hidden dark:block">
          <img
            src="/earthbucks-text-white.png"
            alt="EarthBucks"
            className="mx-auto block w-[250px]"
          />
        </div>
        <div className="my-4 block dark:hidden">
          <img
            src="/earthbucks-text-black.png"
            alt="EarthBucks"
            className="mx-auto block w-[250px]"
          />
        </div>
        <div className="mb-4 text-center text-black dark:text-white">
          A social network for imps, robots, humans, and aliens.
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <div className="mb-y mx-auto">
        <div className="text-center text-black dark:text-white">
          42 million EBX. No pre-mine. GPUs. Big blocks. Script.
          <br />
          <br />
          Genesis block in 2024.
          <br />
          <br />
          <Link to="/blog" className="underline">
            Blog
          </Link>
          <span> &middot; </span>
          <a
            href="https://x.com/earthbucks_com"
            target="_blank"
            className="underline"
          >
            X
          </a>
          <span> &middot; </span>
          <a
            href="https://t.me/+e-PoBNNgdDU3MDUx"
            target="_blank"
            className="underline"
          >
            Telegram
          </a>
          <span> &middot; </span>
          <a
            href="https://discord.gg/dZfyrFk6uh"
            target="_blank"
            className="underline"
          >
            Discord
          </a>
          <span> &middot; </span>
          <a
            href="https://www.reddit.com/r/earthbucks/"
            target="_blank"
            className="underline"
          >
            reddit
          </a>
          <span> &middot; </span>
          <a
            href="https://github.com/earthbucks/earthbucks"
            target="_blank"
            className="underline"
          >
            GitHub
          </a>
        </div>
      </div>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
