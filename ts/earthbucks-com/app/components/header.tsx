import { $image } from "~/images";
import Logo from "./logo";
import { Link } from "@remix-run/react";
import { $path } from "remix-routes";

export default function Header() {
  return (
    <div className="mt-4 flex">
      <div className="mx-auto">
        <div className="inline-block align-middle">
          <Link to={$path("/")}>
            <Logo />
          </Link>

          <h1 className="my-4 text-center text-2xl font-bold text-black dark:text-white">
            EarthBucks
          </h1>

          <p className="text-center text-black dark:text-white">
            A social network for imps, robots, humans, and aliens.
          </p>
        </div>
      </div>
    </div>
  );
}
