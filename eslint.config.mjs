import pluginNext from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

const { rules, configs } = pluginNext;
const { plugins, ...nextRules } = configs.recommended;

export default defineConfig([
  nextRules,
  prettierConfig,
  {
    plugins: { '@next/next': { rules } },
  },
]);
