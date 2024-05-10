import { $image } from "~/images";
import Logo from "./logo";

export default function Header() {
  return (
    <div className="mt-4 flex">
      <div className="mx-auto">
        <div className="inline-block align-middle">
          <Logo />

          <h1 className="my-4 text-center text-2xl font-bold text-black dark:text-white">
            EarthBucks
          </h1>

          <p className="text-center text-black dark:text-white">
            Small casual transactions for everybody on Planet Earth.
          </p>
        </div>
      </div>
    </div>
  );
}
