/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        rounded: ['"Baloo 2"', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#F0F9F4', // Xanh lá nhẹ sáng chuyên nghiệp (Soft Sage Mint)
        card: '#FFFFFF',
        sidebar: '#FFFFFF',
        heading: '#0F172A',
        subtext: '#64748B',
        borderLight: '#E2E8F0',
        primary: {
          DEFAULT: '#0284C7', // Sky 600 - Xanh sáng hiện đại
          hover: '#0369A1',   // Sky 700
          light: '#F0F9FF',   // Sky 50
          dark: '#075985',
        },
        accent: {
          blue: '#2563EB',
          sky: '#0EA5E9',
          cyan: '#06B6D4',
        }
      },
      boxShadow: {
        'glass-3d': '0 4px 14px 0 rgba(2, 132, 199, 0.25)',
        'glass-3d-hover': '0 8px 25px 0 rgba(2, 132, 199, 0.35)',
        'soft-card': '0 2px 12px 0 rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 30px -4px rgba(2, 132, 199, 0.12)',
      },
    },
  },
  plugins: [],
};
