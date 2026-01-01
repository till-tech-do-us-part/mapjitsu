import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#3b82f6',
          amber: '#f59e0b',
          pink: '#ec4899',
          red: '#ef4444',
          green: '#22c55e',
        },
        cyber: {
          water: '#0f172a',
          bg: '#020617',
          building: '#1e293b',
          text: '#f8fafc',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
export default config
