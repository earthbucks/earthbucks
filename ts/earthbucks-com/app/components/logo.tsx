import { $image } from "~/images";

export default function Logo() {
  return (
    <div className="mx-auto block aspect-square w-[120px] ">
      <img src={$image("/earthbucks-e.png")} alt="" className="block" />
    </div>
  );
}
