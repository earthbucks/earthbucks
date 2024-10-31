import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { ChevronDoubleRightIcon } from "@heroicons/react/16/solid/index.js";
import { twMerge } from "tailwind-merge";
import impAvatarIcon from "./imp-avatar-bw.png";
import computeCircleIcon from "./compute-circle-128.png";
import buttonIcon from "./button-128.png";
import pinkHeartIcon from "./pink-heart-128.png";
import errorIcon from "./error-2-96.png";
import compuchaBottlecapIcon from "./compucha-bottlecap-128.png";
import blackButtonIcon from "./black-button-128.png";
export function $image(src) {
  return src;
}
export function Spinner({ className }) {
  return _jsxs("svg", {
    "aria-hidden": "true",
    className: twMerge(
      "mr-2 aspect-square w-[36px] animate-spin fill-black/50 text-[#42f6eb]",
      className,
    ),
    viewBox: "0 0 100 101",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    children: [
      _jsx("path", {
        d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z",
        fill: "currentColor",
      }),
      _jsx("path", {
        d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z",
        fill: "currentFill",
      }),
    ],
  });
}
export function Avatar({ userAvatarUrl, className }) {
  return _jsx("img", {
    src: userAvatarUrl ? userAvatarUrl : impAvatarIcon,
    alt: "Avatar for user",
    className: twMerge("block aspect-square rounded-full", className),
  });
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
  buttonSrc = $image("/images/button-128.png"),
  delayComputedMs = 0,
  disabled = false,
}) {
  const [initialDisplayText, setInitialDisplayText] = useState(initialText);
  const [computingDisplayText, setComputingDisplayText] =
    useState(computingText);
  const [successDisplayText, setSuccessDisplayText] = useState(successText);
  const [errorDisplayText, setErrorDisplayText] = useState(errorText);
  useEffect(() => {
    setInitialDisplayText(initialText);
    setComputingDisplayText(computingText);
    setSuccessDisplayText(successText);
    setErrorDisplayText(errorText);
  }, [initialText, computingText, successText, errorText]);
  // const sliderStates = [
  //   "disabled",
  //   "initial",
  //   "dragging",
  //   "computing",
  //   "success",
  //   "error",
  //   "finished-error",
  //   "finished-success",
  // ];
  const [sliderState, setSliderState] = useState(
    disabled ? "disabled" : "initial",
  );
  useEffect(() => {
    setSliderState(disabled ? "disabled" : "initial");
  }, [disabled]);
  const [startX, setStartX] = useState(0);
  const [buttonX, setButtonX] = useState(0);
  function handleOnComputing() {
    const computingPromise = onComputing();
    const delayPromise = new Promise((resolve) =>
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
  const giveSwipeHint = () => {
    if (sliderState !== "initial") {
      return;
    }
    setInitialDisplayText("Swipe");
    setTimeout(() => {
      setInitialDisplayText(initialText);
    }, 2000);
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (sliderState !== "initial") {
      return;
    }
    setSliderState("dragging");
    setStartX(e.clientX - buttonX);
  };
  const maxButtonX = 208; // Maximum X position for the button, adjust based on the position of the dotted circle
  const handleMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setInitialDisplayText(initialText);
    if (sliderState !== "dragging") {
      return;
    }
    let newButtonX = e.clientX - startX;
    newButtonX = Math.max(0, newButtonX);
    newButtonX = Math.min(newButtonX, maxButtonX);
    setButtonX(newButtonX);
  };
  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (buttonX >= maxButtonX) {
      setSliderState("computing");
      setButtonX(maxButtonX);
      handleOnComputing();
    } else {
      setSliderState("initial");
      giveSwipeHint();
      setButtonX(0);
    }
  };
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (sliderState !== "initial") {
      return;
    }
    setSliderState("dragging");
    const clientX = e.touches[0]?.clientX || 0;
    setStartX(clientX - buttonX);
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (sliderState !== "dragging") {
      return;
    }
    const clientX = e.touches[0]?.clientX || 0;
    let newButtonX = clientX - startX;
    newButtonX = Math.max(0, newButtonX);
    newButtonX = Math.min(newButtonX, maxButtonX);
    setButtonX(newButtonX);
  };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (buttonX >= maxButtonX) {
      setSliderState("computing");
      setButtonX(maxButtonX);
      handleOnComputing();
    } else {
      setSliderState("initial");
      giveSwipeHint();
      setButtonX(0);
    }
  };
  const buttonRef = useRef(null);
  // Combine useEffect hooks for mouse and touch events to avoid duplication
  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const buttonElement = buttonRef.current;
    const handleNativeTouchStart = (e) => {
      handleTouchStart(e);
    };
    const controller = new AbortController();
    const { signal } = controller;
    if (buttonElement) {
      buttonElement.addEventListener("touchstart", handleNativeTouchStart, {
        passive: false,
        signal,
      });
    }
    if (sliderState === "dragging") {
      window.addEventListener("mousemove", handleMouseMove, { signal });
      window.addEventListener("mouseup", handleMouseUp, { signal });
      window.addEventListener("touchmove", handleTouchMove, {
        passive: false,
        signal,
      });
      window.addEventListener("touchend", handleTouchEnd, { signal });
    } else {
      controller.abort();
    }
    return () => {
      controller.abort();
    };
  }, [sliderState, startX, buttonX, maxButtonX]);
  return _jsx("div", {
    className: "h-full w-full p-[8px]",
    children: _jsx("div", {
      className:
        "h-full w-full rounded-full bg-gray-950/60 ring-2 ring-green-300/70",
      onClick: giveSwipeHint,
      onKeyDown: giveSwipeHint,
      children: _jsxs("div", {
        className: "flex h-full",
        children: [
          _jsxs("div", {
            className: "relative h-full flex-shrink",
            children: [
              _jsx("div", {
                className: twMerge(
                  "absolute z-40 m-[-8px] h-[52px] w-[52px] p-[8px]",
                  sliderState === "dragging"
                    ? "rounded-full outline outline-4 outline-green-300"
                    : "",
                  sliderState === "disabled" ? "opacity-50" : "",
                ),
                ref: buttonRef,
                onMouseDown: handleMouseDown,
                onTouchStart: handleTouchStart,
                style: {
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
                },
                children: _jsx("img", {
                  src: buttonIcon,
                  alt: "",
                  className: "h-[36px] w-[36px]",
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "computing"
                    ? "absolute top-0 block h-[36px] w-[36px]"
                    : "hidden",
                ),
                children: _jsx(Spinner, {}),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "success"
                    ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                    : "hidden",
                ),
                children: _jsxs("div", {
                  className: "relative h-[36px] w-[36px]",
                  children: [
                    _jsx("img", {
                      src: pinkHeartIcon,
                      alt: "",
                      className: "h-[36px] w-[36px]",
                      draggable: "false",
                    }),
                    _jsx("img", {
                      src: pinkHeartIcon,
                      alt: "",
                      className:
                        "absolute top-0 h-[36px] w-[36px] animate-ping",
                      draggable: "false",
                    }),
                  ],
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "finished-success"
                    ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                    : "hidden",
                ),
                children: _jsx("div", {
                  className: "relative h-[36px] w-[36px]",
                  children: _jsx("img", {
                    src: pinkHeartIcon,
                    alt: "",
                    className: "h-[36px] w-[36px]",
                    draggable: "false",
                  }),
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "error"
                    ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                    : "hidden",
                ),
                children: _jsxs("div", {
                  className: "relative h-[36px] w-[36px]",
                  children: [
                    _jsx("img", {
                      src: errorIcon,
                      alt: "",
                      className: "h-[36px] w-[36px]",
                      draggable: "false",
                    }),
                    _jsx("img", {
                      src: errorIcon,
                      alt: "",
                      className:
                        "absolute top-0 h-[36px] w-[36px] animate-ping",
                      draggable: "false",
                    }),
                  ],
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "finished-error"
                    ? "absolute top-0 flex h-[36px] w-[36px] items-center"
                    : "hidden",
                ),
                children: _jsx("div", {
                  className: "relative h-[36px] w-[36px]",
                  children: _jsx("img", {
                    src: errorIcon,
                    alt: "",
                    className: "h-[36px] w-[36px]",
                    draggable: "false",
                  }),
                }),
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex h-full flex-grow items-center overflow-x-hidden",
            children: [
              _jsx("div", {
                className: twMerge(
                  sliderState === "disabled" ? "flex items-center" : "hidden",
                  "",
                ),
                children: _jsx("span", {
                  className:
                    "ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle font-semibold text-sm text-white/50",
                  children: initialDisplayText,
                }),
              }),
              _jsxs("div", {
                className: twMerge(
                  sliderState === "initial" || sliderState === "dragging"
                    ? "flex items-center"
                    : "hidden",
                  "",
                ),
                children: [
                  _jsx(ChevronDoubleRightIcon, {
                    className: "ml-[34px] inline-block h-6 w-6 text-green-300",
                  }),
                  _jsx("span", {
                    className:
                      "inline-block max-w-[120px] overflow-hidden align-middle font-semibold text-sm text-white",
                    children: initialDisplayText,
                  }),
                  _jsx(ChevronDoubleRightIcon, {
                    className: "inline-block h-6 w-6 text-green-300",
                  }),
                ],
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "computing"
                    ? "flex animate-pulse items-center"
                    : "hidden",
                ),
                children: _jsx("span", {
                  className:
                    "ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle font-semibold text-sm text-white",
                  children: computingDisplayText,
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "success"
                    ? "flex animate-pulse items-center"
                    : "hidden",
                ),
                children: _jsx("span", {
                  className:
                    "ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle font-semibold text-sm text-white",
                  children: successDisplayText,
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "finished-success"
                    ? "flex items-center"
                    : "hidden",
                ),
                children: _jsx("span", {
                  className:
                    "ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle font-semibold text-sm text-white",
                  children: successDisplayText,
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "error"
                    ? "flex animate-pulse items-center"
                    : "hidden",
                ),
                children: _jsx("span", {
                  className:
                    "ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle font-semibold text-sm text-white",
                  children: errorDisplayText,
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  sliderState === "finished-error"
                    ? "flex items-center"
                    : "hidden",
                ),
                children: _jsx("span", {
                  className:
                    "ml-[40px] inline-block max-w-[160px] overflow-hidden align-middle font-semibold text-sm text-white",
                  children: errorDisplayText,
                }),
              }),
            ],
          }),
          _jsxs("div", {
            className: "relative z-30 h-full flex-shrink",
            children: [
              _jsx("div", {
                className: twMerge(
                  "aspect-square h-full rounded-full",
                  sliderState === "initial"
                    ? "outline-dotted outline-2 outline-green-300"
                    : sliderState === "dragging"
                      ? "outline-dashed outline-4 outline-green-300"
                      : "hidden",
                ),
                style: {
                  animation:
                    sliderState === "initial" || sliderState === "dragging"
                      ? "buttonSpin 10s linear infinite"
                      : undefined,
                },
                children: _jsx("img", {
                  src: computeCircleIcon,
                  alt: "",
                  className: "h-20px] w-[40px]",
                }),
              }),
              _jsx("div", {
                className: twMerge(
                  "aspect-square h-full rounded-full",
                  sliderState === "error"
                    ? "outline-dashed outline-2 outline-black"
                    : "hidden",
                ),
                style: {
                  animation:
                    sliderState === "error"
                      ? "buttonSpin 10s linear infinite"
                      : undefined,
                },
              }),
              _jsx("img", {
                src: buttonSrc,
                alt: "",
                className: twMerge(
                  "relative z-[35] h-full",
                  sliderState === "computing" ? "block animate-ping" : "hidden",
                ),
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
export function Button({
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
  userAvatarUrl,
  className = "",
}) {
  computingText = computingText.replaceAll(".", "");
  computingText = `${computingText}...`;
  let buttonSrc = "";
  if (buttonMode === "standard") {
    buttonSrc = buttonIcon;
  } else if (buttonMode === "compucha") {
    buttonSrc = compuchaBottlecapIcon;
  } else if (buttonMode === "secret") {
    buttonSrc = blackButtonIcon;
  }
  const MAX_TEXT_LEN = 16;
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
  return _jsx("div", {
    className: twMerge("flex h-[60px] w-[320px]", className),
    children: _jsx("div", {
      className:
        "mx-auto h-[60px] w-[320px] rounded-full bg-gray-950 p-[1px] shadow-black/50 shadow-lg dark:bg-gray-50",
      children: _jsx("div", {
        className: "h-full w-full rounded-full bg-green-300 p-[3px]",
        children: _jsx("div", {
          className:
            "relative h-full w-full rounded-full bg-blue-500 shadow-[inset_5px_5px_10px_#04408d]",
          children: _jsx("div", {
            className: "absolute z-20 h-full w-full",
            children: _jsxs("div", {
              className: "flex h-full",
              children: [
                _jsx("div", {
                  className: "h-full flex-grow",
                  children: _jsx(Slider, {
                    initialText: initialText,
                    computingText: computingText,
                    successText: successText,
                    errorText: errorText,
                    onComputing: onComputing,
                    onSuccess: onSuccess,
                    onError: onError,
                    onFinishedSuccess: onFinishedSuccess,
                    onFinishedError: onFinishedError,
                    buttonSrc: buttonSrc,
                    delayComputedMs: delayComputedMs,
                    disabled: disabled,
                  }),
                }),
                _jsx("div", {
                  className: "h-full flex-shrink-0",
                  children: _jsx(Avatar, {
                    userAvatarUrl: userAvatarUrl,
                    className: "outline outline-1 outline-green-300",
                  }),
                }),
              ],
            }),
          }),
        }),
      }),
    }),
  });
}
