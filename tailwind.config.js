/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: The "content" array should remain as is, or you might need to add other paths if necessary.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        green: {
          600: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [],
}
