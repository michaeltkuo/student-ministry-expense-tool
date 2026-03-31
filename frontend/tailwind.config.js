/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cru: {
          yellow: '#FFD000',
          white: '#FFFFFF',
          gray: '#F0EFEE',
          black: '#000000',
          orange: '#F08020',
          cyan: '#00C0D8',
          turquoise: '#007890',
          navy: '#1F1F47',
          graphite: '#565652',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
