import type { Config } from 'tailwindcss';

import colors from 'tailwindcss/colors';

import tailwindcss_animate from 'tailwindcss-animate';

const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Add a custom content pattern to ensure color classes are preserved
    {
      raw: [
        // Ensure all color classes used in dynamic color schemes are preserved
        'bg-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-(50|100|200|300|400|500|600|700|800|900)',
        'text-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-(50|100|200|300|400|500|600|700|800|900)',
        'ring-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-(50|100|200|300|400|500|600|700|800|900)',
        'hover:bg-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-(50|100|200|300|400|500|600|700|800|900)',
        'dark:bg-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-(50|100|200|300|400|500|600|700|800|900)/50',
        'dark:text-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-(50|100|200|300|400|500|600|700|800|900)',
        'dark:ring-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-(50|100|200|300|400|500|600|700|800|900)',
        // Ensure tooltip-specific styles are preserved
        'bg-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-50 dark:bg-(blue|green|amber|emerald|purple|pink|violet|teal|gray|neutral|transparent|slate|zinc|stone|red|orange|yellow|lime|indigo|sky|cyan|fuchsia|rose|black|white|current|today|past)-900/90',
      ].join('\n'),
    },
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
      },
    },
  },
  plugins: [tailwindcss_animate],
} satisfies Config;

export default config;
