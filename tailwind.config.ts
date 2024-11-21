import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    colors: {
      primary: colors.indigo,
      secondary: colors.gray,
      danger: colors.red,
      success: colors.green,
      warning: colors.amber,
      info: colors.blue,
      ...colors,
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
export default config;
