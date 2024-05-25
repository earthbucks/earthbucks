import { Link } from "@remix-run/react";
import { $path } from "remix-routes";

export default function Footer() {
  return (
    <div className="mx-auto mb-4">
      <div className="text-center mb-4 text-sm text-black dark:text-white">
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
      <div className="text-center text-sm text-black dark:text-white">
        Copyright &copy; 2024 Ryan X. Charles LLC
        <span> &middot; </span>
        <Link to={$path("/")} className="underline">
          Home
        </Link>
        <span> &middot; </span>
        <Link to={$path("/about")} className="underline">
          About
        </Link>
      </div>
    </div>
  );
}
