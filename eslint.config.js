import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-base/**', 'node_modules/**', '.astro/**'] },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
);
