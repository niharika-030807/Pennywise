/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        penny: {
          black: '#050509',
          darknavy: '#080B24',
          navy: '#101536',
          deeppurple: '#35004F',
          purple: '#7800B8',
          magenta: '#D900A8',
          hotpink: '#FF1493',
          softpink: '#FF69B4',
          muted: '#A5A5B8',
          border: 'rgba(217, 0, 168, 0.2)',
          card: 'rgba(16, 21, 54, 0.65)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 25px -5px rgba(255, 20, 147, 0.35)',
        'glow-purple': '0 0 30px -5px rgba(120, 0, 184, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'penny-gradient': 'linear-gradient(135deg, #050509 0%, #080B24 25%, #35004F 60%, #7800B8 85%, #FF1493 100%)',
      }
    },
  },
  plugins: [],
}

