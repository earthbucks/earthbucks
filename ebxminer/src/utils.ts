import gradient from "gradient-string";

export const g: ReturnType<typeof gradient> = gradient(["#00b0ff", "#76ff03"]);

export const formatNumber = new Intl.NumberFormat().format;
