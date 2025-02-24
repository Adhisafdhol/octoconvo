import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      colors: {
        brand: {
          1: "var(--brand-1)",
          2: "var(--brand-2)",
          3: "var(--brand-3)",
          4: "var(--brand-4)",
        },
        white: {
          100: "var(--white-100)",
          200: "var(--white-200)",
        },
        grey: {
          100: "var(--grey-100)",
          200: "var(--grey-200)",
        },
        black: {
          100: "var(--black-100)",
          200: "var(--black-200)",
          300: "var(--black-300)",
          400: "var(--black-400)",
        },
        invalid: "var(--invalid)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        s: ["var(--s)", { lineHeight: "1.5" }],
        p: ["var(--p)", { lineHeight: "1.5" }],
        h6: ["var(--h6)", { lineHeight: "1.5" }],
        h5: ["var(--h5)", { lineHeight: "1.5" }],
        h4: ["var(--h4)", { lineHeight: "1.25" }],
        h3: ["var(--h3)", { lineHeight: "1.25" }],
        h2: ["var(--h2)", { lineHeight: "1.25" }],
        h1: ["var(--h1)", { lineHeight: "1.25" }],
      },
      backgroundImage: {
        "gr-1-t": "var(--gradient-1-t)",
        "gr-1-d45": "var(--gradient-1-d45)",
        "gr-2-t": "var(--gradient-2-t)",
        "gr-bg-d": "var(--gradient-bg-d)",
      },
    },
  },
  plugins: [],
} satisfies Config;
