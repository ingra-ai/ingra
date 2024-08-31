// tailwind config is required for editor support

import type { Config } from 'tailwindcss';
import sharedConfig from '@repo/tailwind-config';

const config: Pick<Config, 'darkMode' | 'content' | 'presets'> = {
  darkMode: ['selector'],
  content: ['./app/**/*.tsx', './components/**/*.tsx', '../../packages/components/src/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig],
};

export default config;
