/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        card: '#FFFFFF',
        sidebar: '#1E293B',
        heading: '#0F172A',
        subtext: '#64748B',
        borderLight: '#E2E8F0',
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          dark: '#1E40AF',
        },
      },
      boxShadow: {
        'glass-3d': '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
        'glass-3d-hover': '0 8px 25px 0 rgba(37, 99, 235, 0.45)',
        'soft-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
