// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      'import/no-unresolved': 'off',
      'import/duplicates': 0,
      'import/no-duplicates': 0,
      'import/namespace': 'off',
    },
  },
]);
