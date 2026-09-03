/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas': '#FDFBF7',
        'surface-elevated': '#F7F4EE',
        'surface-recessed': '#EFECE6',
        'hairline': '#E7E3DC',
        'ink-primary': '#1F2421',
        'ink-muted': '#4B534D',
        'ink-subtle': '#7E8881',
        'clay': {
          DEFAULT: '#E05A47',
          hover: '#D04B38',
          wash: '#FAF0EE',
        },
        'sage': {
          DEFAULT: '#4A7C59',
          bg: '#EDF4EF',
        },
        'ochre': {
          DEFAULT: '#D99B4B',
          bg: '#FDF5EB',
          text: '#B87B2E',
        },
        // DESIGN.md standard token palette
        'surface': '#f2fcf3',
        'surface-dim': '#d2ddd4',
        'surface-bright': '#f2fcf3',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#ecf6ee',
        'surface-container': '#e6f0e8',
        'surface-container-high': '#e1ebe2',
        'surface-container-highest': '#dbe5dd',
        'on-surface': '#151d19',
        'on-surface-variant': '#58413d',
        'outline': '#8c716c',
        'outline-variant': '#e0bfba',
        'primary': '#a83223',
        'on-primary': '#ffffff',
        'primary-container': '#c94a38',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Newsreader"', 'serif'],
        editorial: ['"Newsreader"', 'serif'],
      },
      boxShadow: {
        'floating': '0 8px 24px -4px rgba(31, 36, 33, 0.05), 0 2px 6px -1px rgba(31, 36, 33, 0.03)',
        'modal': '0 20px 48px -8px rgba(31, 36, 33, 0.08), 0 4px 12px -2px rgba(31, 36, 33, 0.04)',
      },
      maxWidth: {
        'feed': '42rem',
        'reading': '48rem',
        'layout': '76rem',
      },
      borderRadius: {
        'card': '1.25rem', // 20px
        'control': '0.75rem', // 12px
      }
    },
  },
  plugins: [],
}
