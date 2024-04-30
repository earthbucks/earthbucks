/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    screens: {
      xs: "450px",
      ...defaultTheme.screens,
      "3xl": "1600px",
      "4xl": "1860px",
    },
    extend: {
      width: {
        "mobile-min": "300px",
      },
      colors: {
        "background-light": "#fff",
        "background-dark": "#000",
        "picton-blue": {
          50: "#f0faff",
          100: "#e0f3fe",
          200: "#bbe9fc",
          300: "#7fd8fa",
          400: "#3bc5f5",
          500: "#12b3ec", // primary
          600: "#058cc4",
          700: "#066f9e",
          800: "#095e83",
          900: "#0e4f6c",
          950: "#093248",
        },
        "bright-turquoise": {
          50: "#effefc",
          100: "#c8fff8",
          200: "#91fef3",
          300: "#42f6eb", // secondary
          400: "#1ee3dd",
          500: "#05c7c5",
          600: "#019fa0",
          700: "#067c7f",
          800: "#0a6265",
          900: "#0e5053",
          950: "#002f33",
        },
        "congress-blue": {
          50: "#ebfaff",
          100: "#d3f1ff",
          200: "#b0e7ff",
          300: "#7adcff",
          400: "#3cc4ff",
          500: "#0fa2ff",
          600: "#0080ff",
          700: "#0067ff",
          800: "#0053d1",
          900: "#04408d", // shadow
          950: "#092d62",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
