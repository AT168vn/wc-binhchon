/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 Bắt buộc nếu muốn dùng dark:bg-... text-... theo class
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['ui-serif', 'Georgia'],
        mono: ['ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        zMauVang: '#F7D794',
        background: '#ffffff',
        foreground: '#171717',
        darkBackground: '#0a0a0a',
        darkForeground: '#ededed',
        /* 1. Professional Trust - Hình 1 */
        primary: {
          DEFAULT: '#007BFF',
          500: '#007BFF',
          600: '#0062CC',
        },
        secondary: {
          DEFAULT: '#17A2B8',
          500: '#17A2B8',
        },
        /* 2. Modern Wellness - Hình 2 */
        surface: {
          ground: '#F8F9FA',
          card: '#FFFFFF',
          border: '#E9ECEF',
        },
        'text-primary': '#212529',
        'deep-navy': '#2d3e50',
        'soft-gray': '#E9ECEF',
        /* 3. Semantic Status - Hình 3 */
        status: {
          pending: '#6C757D',
          progress: '#007BFF',
          completed: '#28A745',
          urgent: '#DC3545',
        },
      },
      boxShadow: {
        health: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'progress-bar': 'progress-bar 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'windows-dot1': 'windows-dot 2s ease-in-out infinite',
        'windows-dot2': 'windows-dot 2s ease-in-out infinite 0.5s',
        'windows-dot3': 'windows-dot 2s ease-in-out infinite 1s',
        'windows-dot4': 'windows-dot 2s ease-in-out infinite 1.5s',
      },
      keyframes: {
        'progress-bar': {
          '0%': { width: '0%', marginLeft: '0%' },
          '20%': { width: '20%', marginLeft: '0%' },
          '40%': { width: '30%', marginLeft: '20%' },
          '60%': { width: '40%', marginLeft: '40%' },
          '80%': { width: '30%', marginLeft: '70%' },
          '100%': { width: '20%', marginLeft: '100%' },
        },
        'windows-dot': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.7)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
