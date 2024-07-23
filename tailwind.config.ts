import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import flowbite from 'flowbite-react/tailwind';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    flowbite.content(),
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      padding: {
        '5.5': '1.375rem',
        '4.5': '1.125rem',
      },
      fontSize: {
        '2xs': '.625rem',
      },
      lineHeight: {
        '2xs': '.75rem',
      },
      width: {
        7.5: '1.875rem',
      },
      height: {
        7.5: '1.875rem',
      },
    },
    colors: {
      primary: colors.lime,
      secondary: colors.gray,
      danger: colors.red,
      success: colors.green,
      warning: colors.amber,
      info: colors.blue,
      semiblack: '#030712',
      ...colors,
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    flowbite.plugin(),
  ],
};
export default config;
