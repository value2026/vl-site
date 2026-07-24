/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#af0c3e',
          50:  '#fdf2f4',
          100: '#fbe5e9',
          200: '#f7cfd7',
          300: '#f09fb1',
          400: '#e56482',
          500: '#d5345b',
          600: '#be1b44',
          700: '#9e1137',
          800: '#af0c3e',
          900: '#6d0b28',
          950: '#400314',
        },
        secondary: {
          DEFAULT: '#f4b400',
          50:  '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f4b400',
          600: '#d97706',
        },
        accent: {
          DEFAULT: '#2563eb',
          50:  '#eff6ff',
          500: '#2563eb',
          600: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #af0c3e 0%, #6d0b28 50%, #30020e 100%)',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.18)',
        glow: '0 0 30px rgba(175,12,62,0.35)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
