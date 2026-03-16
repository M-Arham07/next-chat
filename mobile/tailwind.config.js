/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "rgb(235 235 240)",
        input: "rgb(245 245 250)",
        ring: "rgb(51 65 85 / 0.5)",
        background: "rgb(248 248 252)",
        foreground: "rgb(15 23 42)",
        primary: {
          DEFAULT: "rgb(30 30 30)",
          foreground: "rgb(250 250 250)",
        },
        secondary: {
          DEFAULT: "rgb(235 235 240)",
          foreground: "rgb(20 20 23)",
        },
        destructive: {
          DEFAULT: "rgb(239 68 68)",
          foreground: "rgb(255 255 255)",
        },
        muted: {
          DEFAULT: "rgb(226 232 240)",
          foreground: "rgb(100 116 139)",
        },
        accent: {
          DEFAULT: "rgb(30 30 30)",
          foreground: "rgb(250 250 250)",
        },
        success: {
          DEFAULT: "rgb(34 197 94)",
          foreground: "rgb(245 245 245)",
        },
      },
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};
