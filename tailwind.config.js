/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        card: '#18181b',
        muted: '#27272a',
        'muted-foreground': '#a1a1aa',
      },
      borderRadius: {
        'xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
