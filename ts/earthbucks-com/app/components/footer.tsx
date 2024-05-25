import { Link } from "@remix-run/react";
import { $path } from "remix-routes";

export default function Footer() {
  return (
    <div className="mx-auto mb-4">
      <div className="mb-4 text-center text-sm text-black dark:text-white"></div>
      <div className="text-center text-sm text-black dark:text-white">
        <Link to={$path("/")} className="underline">
          Home
        </Link>
        <span> &middot; </span>
        <Link to={$path("/about")} className="underline">
          About
        </Link>
        <span> &middot; </span>
        <Link to="/blog" className="underline">
          Blog
        </Link>
        <br />
        Copyright &copy; 2024 Ryan X. Charles LLC
      </div>
    </div>
  );
}
