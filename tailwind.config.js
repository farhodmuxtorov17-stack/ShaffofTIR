/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        shell: { bg: '#f1f5f4', surface: '#ffffff', border: '#e8edec' },
      },
      borderRadius: { shell: '28px', card: '20px', btn: '12px' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        shell: '0 20px 60px -15px rgba(0,0,0,0.12), 0 8px 25px -10px rgba(0,0,0,0.06)',
        card: '0 2px 8px -2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        'card-hover': '0 12px 32px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.06)',
        '3d': '0 20px 40px -12px rgba(0,0,0,0.15), 0 8px 16px -8px rgba(0,0,0,0.08)',
        '3d-hover': '0 30px 50px -12px rgba(0,0,0,0.2), 0 12px 24px -8px rgba(0,0,0,0.1)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.15)',
        brand: '0 8px 20px -6px rgba(22,163,74,0.35)',
        'brand-hover': '0 12px 28px -6px rgba(22,163,74,0.45)',
        glass: '0 8px 32px -4px rgba(0,0,0,0.08), inset 0 1px 0 0 rgba(255,255,255,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer-3d': 'shimmer3d 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 20px -4px rgba(22,163,74,0.3)' }, '50%': { boxShadow: '0 0 30px -4px rgba(22,163,74,0.5)' } },
        shimmer3d: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
