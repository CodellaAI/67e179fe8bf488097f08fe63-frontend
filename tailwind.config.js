
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          primary: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          'gray-dark': '#2C2F33',
          'gray-light': '#36393F',
          'gray-lighter': '#40444B',
          'gray-lightest': '#4F545C',
          'gray-text': '#DCDDDE',
          'gray-muted': '#72767D',
          'blurple': '#5865F2',
          'dark': '#202225',
        },
      },
    },
  },
  plugins: [],
}
