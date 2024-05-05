import { $image } from "~/util";
import Logo from "./logo";

export default function Header() {
  return (
    <div className="mt-4 flex">
      <div className="mx-auto">
        <div className="inline-block align-middle">
          <Logo />
          <div className="my-4 hidden dark:block">
            <img
              src={$image("/earthbucks-mine-1-text-white.png")}
              alt="EarthBucks Mine 1"
              className="mx-auto block w-[300px]"
            />
          </div>
          <div className="my-4 block dark:hidden">
            <img
              src={$image("/earthbucks-mine-1-text-black.png")}
              alt="EarthBucks Mine 1"
              className="mx-auto block w-[300px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
