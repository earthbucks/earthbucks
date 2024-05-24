import type {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import Footer from "~/components/footer";
import Header from "~/components/header";

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks Mine 1" },
    { name: "description", content: "Welcome to EarthBucks Mine 1!" },
  ];
};

export default function Landing() {
  return (
    <div className="">
      <Header />
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <p className="text-center text-black dark:text-white">Coming soon.</p>
      <hr className="mx-auto my-4 max-w-[40px] border-gray-400 dark:border-gray-600" />
      <Footer />
    </div>
  );
}
