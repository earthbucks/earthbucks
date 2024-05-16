import { Link } from "@remix-run/react";
import { $path } from "remix-routes";

export default function Footer() {
  return (
    <div className="mb-4 flex">
      <div className="mx-auto">
        <div className="inline-block align-middle">
          <div className="text-center text-sm text-black dark:text-white">
            Copyright &copy; 2024 <Link to={$path("/about")} className='underline'>Ryan X. Charles LLC</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
