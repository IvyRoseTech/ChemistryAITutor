/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2f2d8f",
        "background-light": "#f6f6f8",
        "background-dark": "#14141e",
        "correct-teal": "#14b8a6",
        "incorrect-amber": "#f59e0b",
        "charcoal": "#333333",
        "deep-indigo": "#2f2d8f",
        "soft-teal": "#14b8a6"
      },
      fontFamily: {
        "display": ["Inter", "Lexend", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
