import type { Config } from 'tailwindcss';
import tailwindcssRtl from 'tailwindcss-rtl';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px'
      }
    },
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e6edff',
          200: '#c3d1ff',
          300: '#93abff',
          400: '#5b7aff',
          500: '#3250f2',
          600: '#1f39d2',
          700: '#182cab',
          800: '#172786',
          900: '#101b59'
        }
      },
      fontFamily: {
        display: ['"Cairo"', 'system-ui', 'sans-serif'],
        body: ['"Cairo"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        lg: '0.8rem',
        xl: '1.2rem',
        '2xl': '1.6rem'
      }
    }
  },
  plugins: [tailwindcssRtl]
};

export default config;
