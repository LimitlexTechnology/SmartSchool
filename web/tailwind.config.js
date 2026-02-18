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
          teal: "#09637E",
        },
        secondary: {
          teal: "#088395",
        },
        soft: {
          teal: "#7AB2B2",
        },
        light: {
          bg: "#EBF4F6",
        },
        dark: {
          text: "#0F172A",
        },
        muted: {
          text: "#6B7280",
        },
        error: "#DC2626",
        success: "#16A34A",
        warning: "#F59E0B",
      },
      borderRadius: {
        'button': '12px',
        'card': '16px',
        'card-lg': '24px',
        'input': '10px',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        '8pt': '32px', // 8 * 4px = 32px (standard increment)
      }
    },
  },
  plugins: [],
}
