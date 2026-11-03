import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    /*
      `dk:` variant — applies when the navbar's theme toggle puts the page in
      dark mode (it sets `html.dark` and `data-theme="dark"`, and saves
      `theme` in localStorage).

      This is deliberately NOT Tailwind's `darkMode` setting: the existing
      `dark:` classes elsewhere in the site follow the OS preference, and
      changing that globally would alter pages that aren't part of this work.
      `dk:` follows the navbar toggle only.
    */
    plugin(({ addVariant }) => {
      addVariant("dk", [".dark &", '[data-theme="dark"] &']);
    }),
  ],
}
