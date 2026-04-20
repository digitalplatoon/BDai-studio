// tailwind.config.js - Custom Bangla Theme
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/studio/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bangladesh Flag Colors
        'bangla-green': '#006A4E',
        'bangla-red': '#F42A41',
        'bangla-dark': '#0a0f0d',
        'bangla-card': '#111a17',
        'bangla-border': '#1a2e28',
        'bangla-hover': '#1a3c32',

        // Accent colors
        'accent-gold': '#FFD700',
        'accent-cyan': '#00D9FF',
        'accent-magenta': '#FF00A0',

        // Primary gradient
        'primary': '#006A4E',
        'primary-light': '#008f6b',
        'primary-dark': '#004d3a',
      },
      fontFamily: {
        'bangla': ['Noto Sans Bengali', 'Hind Siliguri', 'sans-serif'],
        'display': ['Noto Sans Bengali', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-bangla': 'linear-gradient(135deg, #006A4E 0%, #004d3a 50%, #0a0f0d 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #006A4E, 0 0 10px #006A4E' },
          '100%': { boxShadow: '0 0 20px #006A4E, 0 0 30px #008f6b' },
        },
      },
    },
  },
  plugins: [],
};
