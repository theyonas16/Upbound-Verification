import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // RAC Brand Colors
        'rac-blue': {
          DEFAULT: '#0057A0',
          dark: '#004080',
          light: '#1976D2',
        },
        'rac-yellow': '#FFD200',
        'rac-red': '#E31837',
        'rac-gray': {
          light: '#F5F5F5',
          DEFAULT: '#CCCCCC',
          dark: '#666666',
        },
        'rac-text': {
          primary: '#333333',
          secondary: '#666666',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'heading': '24px',
        'subheading': '16px',
        'body': '14px',
      },
      borderRadius: {
        'rac': '4px',
      },
      spacing: {
        'rac-input': '48px',
      },
      boxShadow: {
        'rac-input': '0 0 0 1px #CCCCCC',
        'rac-input-focus': '0 0 0 2px #0057A0',
      },
    },
  },
  plugins: [],
};

export default config;
