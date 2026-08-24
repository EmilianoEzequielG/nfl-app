/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      fontSize: {
        // Display scale (Bauhaus extreme contrast)
        'display-xs': ['2rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-md': ['4rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-lg': ['5rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-xl': ['6rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-2xl': ['7rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-3xl': ['8rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
      },
      colors: {
        // Bauhaus primaries
        'bauhaus-red': '#D02020',
        'bauhaus-blue': '#1040C0',
        'bauhaus-yellow': '#F0C020',
        'bauhaus-black': '#121212',
        'bauhaus-white': '#FFFFFF',
        'bauhaus-bg': '#F0F0F0',
        'bauhaus-muted': '#E0E0E0',
      },
      spacing: {
        'geo': '4px',
        'geo-2': '8px',
        'geo-3': '12px',
      },
      boxShadow: {
        // Hard offset shadows (Bauhaus signature)
        'geo-sm': '3px 3px 0px 0px rgba(18, 18, 18, 1)',
        'geo-md': '4px 4px 0px 0px rgba(18, 18, 18, 1)',
        'geo-lg': '6px 6px 0px 0px rgba(18, 18, 18, 1)',
        'geo-xl': '8px 8px 0px 0px rgba(18, 18, 18, 1)',
      },
      borderRadius: {
        // Binary: 0 or full only
        'geo': '0',
        'geo-full': '9999px',
      },
      letterSpacing: {
        'geo-tight': '-0.04em',
        'geo-wide': '0.08em',
        'geo-wider': '0.16em',
      },
      transitionDuration: {
        'geo': '200ms',
      },
    },
  },
  plugins: [],
};
