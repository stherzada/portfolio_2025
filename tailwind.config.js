/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6B7280',
                    light: '#9CA3AF',
                    dark: '#4B5563'
                },
                neutral: {
                    300: '#d4d4d4',
                    700: '#404040',
                    900: '#171717'
                }
            }
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [],
} 