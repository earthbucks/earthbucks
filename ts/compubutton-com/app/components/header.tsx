import Logo from "./logo";

export default function Header() {
  return (
    <div className="mt-4 flex">
      <div className="mx-auto">
        <div className="inline-block align-middle">
          <Logo />
          <div className="my-4 hidden dark:block">
            <img
              src="/compubutton-text-white.png"
              alt="Compubutton"
              className="mx-auto block w-[300px]"
            />
          </div>
          <div className="my-4 block dark:hidden">
            <img
              src="/compubutton-text-black.png"
              alt="Compubutton"
              className="mx-auto block w-[300px]"
            />
          </div>
          <div className="mt-4 text-center text-black dark:text-white">
            Welcome to the most advanced button in the world!
          </div>
        </div>
      </div>
    </div>
  );
}
