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
        // Display scale (Bauhaus extreme contrast). Con clamp() para que
        // escale con el viewport, igual que .h1/.h2/.h3 en globals.css - esta
        // escala nunca se aplicaba de verdad (ver @config en globals.css), asi
        // que nadie habia notado que con un valor fijo "POWER RANKING" se veia
        // desproporcionado en mobile.
        'display-xs': ['clamp(1.25rem, 5vw, 2rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.5rem, 6vw, 3rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.75rem, 7vw, 4rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 8vw, 5rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2.25rem, 9vw, 6rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-2xl': ['clamp(2.5rem, 10vw, 7rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-3xl': ['clamp(2.75rem, 11vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
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
