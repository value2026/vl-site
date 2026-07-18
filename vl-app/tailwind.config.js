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
          DEFAULT: '#7a1f1f',
          50:  '#fdf2f2',
          100: '#fce4e4',
          200: '#f9c9c9',
          300: '#f49e9e',
          400: '#ec6666',
          500: '#df3535',
          600: '#cc1e1e',
          700: '#ab1818',
          800: '#7a1f1f',
          900: '#661919',
          950: '#380909',
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
        'hero-gradient': 'linear-gradient(135deg, #7a1f1f 0%, #3d0f0f 50%, #1a0505 100%)',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.18)',
        glow: '0 0 30px rgba(122,31,31,0.3)',
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
