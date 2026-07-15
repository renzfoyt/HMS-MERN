/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        loadingBar: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(150%)" },
          "100%": { transform: "translateX(150%)" },
        },
      },
      animation: {
        loadingBar: "loadingBar 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    base: false,
  },
}