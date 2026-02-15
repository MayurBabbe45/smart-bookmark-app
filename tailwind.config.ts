import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")({
      themes: [
        {
          "smart-dark": {
            primary: "#4f46e5",
            "primary-focus": "#4338ca",
            "primary-content": "#ffffff",

            secondary: "#6366f1",
            "secondary-focus": "#4f46e5",
            "secondary-content": "#ffffff",

            accent: "#14b8a6",
            "accent-focus": "#0d9488",
            "accent-content": "#ffffff",

            neutral: "#1f2733",
            "neutral-focus": "#111827",
            "neutral-content": "#d1d5db",

            "base-100": "#121212",
            "base-200": "#1e1e1e",
            "base-300": "#272727",
            "base-content": "#e5e7eb",

            info: "#3b82f6",
            success: "#22c55e",
            warning: "#f59e0b",
            error: "#ef4444",
          },
        },
      ],
      darkTheme: "smart-dark",
    }),
  ],
};
export default config;