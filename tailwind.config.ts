import type { Config } from 'tailwindcss'
 
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#0F2340', mid: '#1E3A5F' },
        brand: '#2E75B6',
        teal:  { DEFAULT: '#0D7377', light: '#14FFEC' },
      },
      fontFamily: {
        // Sesuaikan dengan font yang dipakai Stitch
        // Cek di globals.css atau layout.tsx untuk nama font aktual
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
