/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Everclear brand colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bcfc',
          400: '#8196f8',
          500: '#6575f1',  // Highlight blue
          600: '#4f54e5',
          700: '#4043ca',
          800: '#3538a3',
          900: '#313480',
        },
        navy: {
          50: '#f3f4f8',
          100: '#e7e9f1',
          200: '#c9cee0',
          300: '#a1aac7',
          400: '#7481aa',
          500: '#546191',
          600: '#414c77',
          700: '#363e61',
          800: '#1a2138',  // Dark navy
          900: '#0f1625',
        },
        grey: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
