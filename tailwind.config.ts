export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in .4s ease-in-out',
      },
    },
  },
  plugins: [],
};
