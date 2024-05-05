import { $image } from "~/util";

export default function Logo() {
  return (
    <div className="mx-auto block aspect-square w-[120px] rounded-full bg-secondary-blue-500 p-[3px] shadow-lg shadow-[#04408d] outline outline-1 outline-black">
      <div className=" rounded-full bg-[#12b3ec] shadow-[inset_5px_5px_10px_#04408d] p-1">
        <img
          src={$image("/earthbucks-coin-3.png")}
          alt=""
          className="block rounded-full"
        />
      </div>
    </div>
  );
}
