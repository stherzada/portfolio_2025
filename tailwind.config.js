import { defineConfig } from '@tailwindcss/vite'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        'primary-dark': '#FFFFFF',
        secondary: '#000000',
        'secondary-dark': '#FFFFFF',
        accent: '#000000',
        'accent-dark': '#FFFFFF',
        neutral: '#666666',
        'neutral-dark': '#999999',
        'base-100': '#FFFFFF',
        'base-100-dark': '#000000',
        'base-200': '#F5F5F5',
        'base-200-dark': '#1A1A1A',
        'base-300': '#E0E0E0',
        'base-300-dark': '#333333',
        'base-content': '#000000',
        'base-content-dark': '#FFFFFF',
        info: '#000000',
        success: '#000000',
        warning: '#000000',
        error: '#000000'
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
}) 