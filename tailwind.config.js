/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          400: "#666666",
          500: "#505050",
          600: "#414141",
          700: "#313131",
          800: "#212121",
          900: "#121212",
          1000: "#060606",
        },
        primary: {
          700: "#33c146",
          800: "#2CA73C",
          900: "#2ba13b",
        },
        accent: {
          900: "#4D7EA8",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
