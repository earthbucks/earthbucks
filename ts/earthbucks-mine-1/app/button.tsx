import React, { useEffect, useRef, useState } from "react";
import { $image } from "./images";
import { ChevronDoubleRightIcon } from "@heroicons/react/16/solid";
import { twMerge } from "tailwind-merge";

function Spinner() {
  return (
    <div role="status" className={"h-[36px] w-[36px]"}>
      <svg
        aria-hidden="true"
        className={`mr-2 h-[36px] w-[36px] animate-spin fill-black/50 text-[#42f6eb]`}
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function Slider({
  initialText,
  computingText,
  successText,
  errorText,
  onComputing = async () => {},
  onSuccess = async () => {},
  onError = async () => {},
  onFinishedSuccess = async () => {},
  onFinishedError = async () => {},
  buttonSrc = $image("/button-128.png"),
  delayComputedMs = 0,
  disabled = false,
}: {
  initialText: string;
  computingText: string;
  successText: string;
  errorText: string;
  onComputing?: () => Promise<void>;
  onSuccess?: () => Promise<void>;
  onError?: (err: Error) => Promise<void>;
  onFinishedSuccess?: () => Promise<void>;
  onFinishedError?: () => Promise<void>;
  buttonSrc?: string;
  delayComputedMs?: number;
  disabled: boolean;
}) {
  const sliderStates = [
    "disabled",
    "initial",
    "dragging",
    "computing",
    "success",
    "error",
    "finished-error",
    "finished-success",
  ];

  const [sliderState, setSliderState] = useState(
    disabled ? "disabled" : "initial",
  );
  useEffect(() => {
    setSliderState(disabled ? "disabled" : "initial");
  }, [disabled]);

  const [startX, setStartX] = useState(0);
  const [buttonX, setButtonX] = useState(0); // Track button's X position

  async function handleOnComputing() {
    let computingPromise = onComputing();
    let delayPromise = new Promise((resolve) =>
      setTimeout(resolve, delayComputedMs),
    );

    Promise.all([computingPromise, delayPromise])
      .then(async () => {
        setSliderState("success");
        await onSuccess();
        setTimeout(async () => {
          setSliderState("finished-success");
          await onFinishedSuccess();
        }, 4000);
      })
      .catch(async (error) => {
        setSliderState("error");
        await onError(error);
        setTimeout(async () => {
          setSliderState("finished-error");
          await onFinishedError();
        }, 4000);
      });
  }

  const handleMouseDown = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
  ) => {
    e.preventDefault();
    if (sliderState !== "initial") return;
    setSliderState("dragging");
    setStartX(e.clientX - buttonX); // Capture initial position minus current button position to allow for drag continuation
  };

  const maxButtonX = 208; // Maximum X position for the button, adjust based on the position of the dotted circle

  const handleMouseMove = (e: { clientX: number }) => {
    if (sliderState !== "dragging") return;
    let newButtonX = e.clientX - startX;

    // Apply constraints
    newButtonX = Math.max(0, newButtonX); // Prevent moving to the left of the starting point
    newButtonX = Math.min(newButtonX, maxButtonX); // Prevent moving beyond the dotted circle

    setButtonX(newButtonX);
  };

  const handleMouseUp = () => {
    // Snap to the center of the dotted circle or return to start
    if (buttonX >= maxButtonX) {
      setSliderState("computing");
      setButtonX(maxButtonX); // Adjust this value to be the center of the dotted circle

      handleOnComputing();
      // setTimeout(() => {
      //   setSliderState("success");
      // }, 2000);
    } else {
      setSliderState("initial");
      setButtonX(0); // Return to the starting point
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevents the default action to ensure smooth behavior
    e.stopPropagation(); // Prevents the event from bubbling up the DOM tree
    if (sliderState !== "initial") return;
    setSliderState("dragging");
    // Use touches[0] to get the first touch point
    const clientX = e.touches[0]?.clientX || 0;
    setStartX(clientX - buttonX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevents the default action to ensure smooth behavior
    e.stopPropagation(); // Prevents the event from bubbling up the DOM tree
    if (sliderState !== "dragging") return;
    const clientX = e.touches[0]?.clientX || 0;
    let newButtonX = clientX - startX;

    // Apply constraints
    newButtonX = Math.max(0, newButtonX);
    newButtonX = Math.min(newButtonX, maxButtonX);

    setButtonX(newButtonX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Snap to the center of the dotted circle or return to start
    if (buttonX >= maxButtonX) {
      setSliderState("computing");
      setButtonX(maxButtonX); // Adjust this value to be the center of the dotted circle

      handleOnComputing();
      // setTimeout(() => {
      //   setSliderState("success");
      // }, 2000);
    } else {
      setSliderState("initial");
      setButtonX(0); // Return to the starting point
    }
  };

  const buttonRef = useRef<HTMLDivElement>(null);

  // Combine useEffect hooks for mouse and touch events to avoid duplication
  useEffect(() => {
    const buttonElement = buttonRef.current;
    // Define the native event handler
    const handleNativeTouchStart = (e: TouchEvent) => {
      // Create a React TouchEvent
      handleTouchStart(e as unknown as React.TouchEvent<HTMLDivElement>);
    };
    if (buttonElement) {
      buttonElement.addEventListener("touchstart", handleNativeTouchStart, {
        passive: false,
      });
    }

    if (sliderState === "dragging") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      // Add touchmove and touchend listeners for mobile support
      window.addEventListener("touchmove", handleTouchMove as any, {
        passive: false,
      });
      window.addEventListener("touchend", handleTouchEnd as any);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      // Remove touchmove and touchend listeners
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("touchend", handleTouchEnd as any);
    }

    return () => {
      if (buttonElement) {
        buttonElement.removeEventListener("touchstart", handleNativeTouchStart);
      }

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      // Cleanup for touch events
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("touchend", handleTouchEnd as any);
    };
  }, [sliderState, startX, buttonX, maxButtonX]);

  return (
    <div className="h-full w-full p-[8px]">
      <div className="h-full w-full rounded-full bg-black/60 ring-2 ring-[#42f6eb]/70">
        <div className="flex h-full">
          <div className="relative h-full flex-shrink">
            <div
              className={twMerge(
                "absolute z-40 m-[-8px] h-[52px] w-[52px] p-[8px]",
                sliderState === "dragging"
                  ? "rounded-full outline outline-4 outline-[#42f6eb]"
                  : "",
                sliderState === "disabled" ? "opacity-50" : "",
              )}
              ref={buttonRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                animation:
                  buttonX === 0 && sliderState !== "disabled"
                    ? "buttonBounce 1s infinite"
                    : undefined,
                transform: `translateX(${buttonX}px)`, // Use translateX to move the button along X-axis
                cursor:
                  sliderState === "initial"
                    ? "grab"
                    : sliderState === "dragging"
                      ? "grabbing"
                      : undefined,
              }}
            >
              <img src={buttonSrc} alt="" className="h-[36px] w-[36px]" />
            </div>
            <div
              className={twMerge(
                sliderState === "computing"
                  ? "absolute top-0 block h-[36px] w-[36px]"
                  : "hidden",
              )}
            >
              <Spinner />
            </div>
            <div
              className={twMerge(
                sliderState === "success"
                  ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                  : "hidden",
              )}
            >
              <div className="relative h-[36px] w-[36px]">
                <img
                  src={$image("/pink-heart-128.png")}
                  alt=""
                  className="h-[36px] w-[36px]"
                  draggable="false"
                />
                <img
                  src={$image("/pink-heart-128.png")}
                  alt=""
                  className="absolute top-0 h-[36px] w-[36px] animate-ping"
                  draggable="false"
                />
              </div>
            </div>
            <div
              className={twMerge(
                sliderState === "finished-success"
                  ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                  : "hidden",
              )}
            >
              <div className="relative h-[36px] w-[36px]">
                <img
                  src={$image("/pink-heart-128.png")}
                  alt=""
                  className="h-[36px] w-[36px]"
                  draggable="false"
                />
              </div>
            </div>
            <div
              className={twMerge(
                sliderState === "error"
                  ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                  : "hidden",
              )}
            >
              <div className="relative h-[36px] w-[36px]">
                <img
                  src={$image("/error-2-96.png")}
                  alt=""
                  className="h-[36px] w-[36px]"
                  draggable="false"
                />
                <img
                  src={$image("/error-2-96.png")}
                  alt=""
                  className="absolute top-0 h-[36px] w-[36px] animate-ping"
                  draggable="false"
                />
              </div>
            </div>
            <div
              className={twMerge(
                sliderState === "finished-error"
                  ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                  : "hidden",
              )}
            >
              <div className="relative h-[36px] w-[36px]">
                <img
                  src={$image("/error-2-96.png")}
                  alt=""
                  className="h-[36px] w-[36px]"
                  draggable="false"
                />
              </div>
            </div>
          </div>
          <div className="flex h-full flex-grow items-center overflow-x-hidden">
            <div
              className={twMerge(
                sliderState === "disabled" ? "flex items-center" : "hidden",
                "",
              )}
            >
              <span className="ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle text-sm font-semibold text-white/50">
                {initialText}
              </span>
            </div>
            <div
              className={twMerge(
                sliderState === "initial" || sliderState === "dragging"
                  ? "flex items-center"
                  : "hidden",
                "",
              )}
            >
              <ChevronDoubleRightIcon className="ml-[34px] inline-block h-6 w-6 text-[#42f6eb]" />
              <span className="inline-block max-w-[120px] overflow-hidden align-middle text-sm font-semibold text-white">
                {initialText}
              </span>
              <ChevronDoubleRightIcon className="inline-block h-6 w-6 text-[#42f6eb]" />
            </div>

            <div
              className={twMerge(
                sliderState === "computing"
                  ? "flex animate-pulse items-center"
                  : "hidden",
              )}
            >
              <span className="ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle text-sm font-semibold text-white">
                {computingText}
              </span>
            </div>
            <div
              className={twMerge(
                sliderState === "success"
                  ? "flex animate-pulse items-center"
                  : "hidden",
              )}
            >
              <span className="ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle text-sm font-semibold text-white">
                {successText}
              </span>
            </div>

            <div
              className={twMerge(
                sliderState === "finished-success"
                  ? "flex items-center"
                  : "hidden",
              )}
            >
              <span className="ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle text-sm font-semibold text-white">
                {successText}
              </span>
            </div>
            <div
              className={twMerge(
                sliderState === "error"
                  ? "flex animate-pulse items-center"
                  : "hidden",
              )}
            >
              <span className="ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle text-sm font-semibold text-white">
                {errorText}
              </span>
            </div>
            <div
              className={twMerge(
                sliderState === "finished-error"
                  ? "flex items-center"
                  : "hidden",
              )}
            >
              <span className="ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle text-sm font-semibold text-white">
                {errorText}
              </span>
            </div>
          </div>
          <div className="relative z-30 h-full flex-shrink">
            <div
              className={twMerge(
                "aspect-square h-full rounded-full",
                sliderState === "initial"
                  ? "outline-dotted outline-2 outline-[#42f6eb]"
                  : sliderState === "dragging"
                    ? "outline-dashed outline-4 outline-[#42f6eb]"
                    : "hidden",
              )}
              style={{
                animation:
                  sliderState === "initial" || sliderState === "dragging"
                    ? "buttonSpin 10s linear infinite"
                    : undefined,
              }}
            >
              <img
                src={$image("/compute-circle-128.png")}
                alt=""
                className="h-20px] w-[40px]"
              />
            </div>
            <div
              className={twMerge(
                "aspect-square h-full rounded-full",
                sliderState === "error"
                  ? "outline-dashed outline-2 outline-black"
                  : "hidden",
              )}
              style={{
                animation:
                  sliderState === "error"
                    ? "buttonSpin 10s linear infinite"
                    : undefined,
              }}
            ></div>
            <img
              src={buttonSrc}
              alt=""
              className={twMerge(
                "relative z-[35] h-full",
                sliderState === "computing" ? "block animate-ping" : "hidden",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type buttonColor =
  | "standard"
  | "pay"
  | "computcha"
  | "secret"
  | "ai"
  | "credits"
  | "mine";

export default function Button({
  initialText = "Swipe",
  computingText = "Computing",
  successText = "Computed!",
  errorText = "Error!",
  onComputing = async () => {},
  onSuccess = async () => {},
  onError = async () => {},
  onFinishedSuccess = async () => {},
  onFinishedError = async () => {},
  mode: buttonMode = "standard",
  delayComputedMs = 0,
  disabled = false,
}: {
  initialText?: string;
  computingText?: string;
  successText?: string;
  errorText?: string;
  onComputing?: () => Promise<void>;
  onSuccess?: () => Promise<void>;
  onError?: (err: Error) => Promise<void>;
  onFinishedSuccess?: () => Promise<void>;
  onFinishedError?: () => Promise<void>;
  mode?: buttonColor;
  delayComputedMs?: number;
  disabled?: boolean;
}) {
  computingText = computingText.replaceAll(".", "");
  computingText = computingText + "...";

  let buttonSrc = "";
  if (buttonMode === "standard") {
    buttonSrc = $image("/button-128.png");
    // } else if (buttonMode === "pay") {
    //   buttonSrc = $image("/earthbucks-42-128.png");
  } else if (buttonMode === "pay") {
    buttonSrc = $image("/earthbucks-earth-1-128.png");
  } else if (buttonMode === "computcha") {
    buttonSrc = $image("/computcha-bottlecap-128.png");
  } else if (buttonMode === "secret") {
    buttonSrc = $image("/black-button-128.png");
  } else if (buttonMode == "ai") {
    buttonSrc = $image("/artintellica-button-128.png");
  } else if (buttonMode == "credits") {
    buttonSrc = $image("/washington-button-128.png");
  } else if (buttonMode == "mine") {
    buttonSrc = $image("/mining-button-128.png");
  }

  let MAX_TEXT_LEN = 16;
  if (initialText.length > MAX_TEXT_LEN) {
    initialText = initialText.slice(0, MAX_TEXT_LEN);
  }
  if (computingText.length > MAX_TEXT_LEN) {
    computingText = computingText.slice(0, MAX_TEXT_LEN);
  }
  if (successText.length > MAX_TEXT_LEN) {
    successText = successText.slice(0, MAX_TEXT_LEN);
  }
  if (errorText.length > MAX_TEXT_LEN) {
    errorText = errorText.slice(0, MAX_TEXT_LEN);
  }

  return (
    <div className="flex h-[60px] w-[320px]">
      <div className="mx-auto h-[60px] w-[320px] rounded-full bg-black dark:bg-white p-[1px] shadow-lg shadow-[#04408d]">
        <div className="h-full w-full rounded-full bg-[#42f6eb] p-[3px]">
          <div className="relative h-full w-full rounded-full bg-[#12b3ec] shadow-[inset_5px_5px_10px_#04408d]">
            <div className="absolute z-20 h-full w-full">
              <div className="flex h-full">
                <div className="h-full flex-grow">
                  <Slider
                    initialText={initialText}
                    computingText={computingText}
                    successText={successText}
                    errorText={errorText}
                    onComputing={onComputing}
                    onSuccess={onSuccess}
                    onError={onError}
                    onFinishedSuccess={onFinishedSuccess}
                    onFinishedError={onFinishedError}
                    buttonSrc={buttonSrc}
                    delayComputedMs={delayComputedMs}
                    disabled={disabled}
                  />
                </div>
                <div className="h-full flex-shrink-0">
                  <img
                    src={$image("/imp-avatar-bw.png")}
                    alt=""
                    className="h-[52px] w-[52px] rounded-full outline outline-1 outline-[#42f6eb]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
