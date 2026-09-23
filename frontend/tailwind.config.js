/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // PMV colour scheme. RED is the primary/brand colour (headers, main
        // buttons, active states, prices). GREEN is the secondary/accent
        // colour (badges, the "Post your Property" CTA, small highlights).
        brand: {
          DEFAULT: '#D80B05', // primary red
          dark: '#AE0001', // deep red (for pressed/hover states, dark text on light bg)
          deep: '#7A0000', // very dark red for sidebars / dark surfaces
          light: '#EA1408', // mid red
          lime: '#F4453D', // highlight red
          50: '#FDEEED',
          100: '#FBDAD8',
        },
        accent: {
          DEFAULT: '#0C7409', // secondary green
          dark: '#06570F', // deep green
          light: '#39A80B',
          50: '#EEF8EA',
        },
        ink: '#14261A', // near-black with a green undertone
      },
      fontFamily: {
        sans: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 14px rgba(10,61,20,0.09)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
      maxWidth: {
        app: '480px', // keeps the mobile-app frame centered on wide screens
      },
    },
  },
  plugins: [],
};
