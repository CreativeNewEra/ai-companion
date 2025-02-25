/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          deep: '#1d4ed8',    // Matches CSS variable
          royal: '#2563eb',   // Matches CSS variable
          electric: '#3b82f6', // Matches CSS variable
          ice: '#60a5fa',     // Matches CSS variable
        },
        dark: {
          900: '#111827',  // Rich black
          800: '#1f2937',  // Dark gray
          700: '#374151',  // Medium gray
          600: '#4b5563',  // Light gray
        },
        light: {
          100: '#FFFFFF',  // White
          200: '#E0E0E0',  // Light gray
          300: '#A0A0A0',  // Medium gray
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        gradientShift: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      dropShadow: {
        'glow': '0 0 3px rgba(75, 123, 255, 0.3)',
        'glow-light': '0 0 2px rgba(230, 240, 255, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    function({ addUtilities }) {
      const newUtilities = {
        '.backdrop-blur-xs': {
          'backdrop-filter': 'blur(2px)',
        },
        '.text-shadow-sm': {
          'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-glow': {
          'text-shadow': '0 0 10px rgba(75, 123, 255, 0.5)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
