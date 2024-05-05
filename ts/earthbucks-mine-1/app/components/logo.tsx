import { $image } from "~/util";

export default function Logo() {
  return (
    <img
      src={$image("/earthbucks-coin-1.png")}
      alt=""
      className="mx-auto block aspect-square w-[120px] rounded-full"
    />
  );
}
