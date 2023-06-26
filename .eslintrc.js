require('@rushstack/eslint-patch/modern-module-resolution');

const path = require('node:path');
const createAliasSetting = require('@vue/eslint-config-airbnb/createAliasSetting');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    '@vue/eslint-config-airbnb',
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'object-curly-spacing': 'off',
    'template-curly-spacing': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'linebreak-style': 'off',
    semi: 'warn',
    'no-unused-vars': 'off',
    'vue/require-default-prop': 'off',
    'import/first': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'vue/max-len': 'off',
    'no-trailing-spaces': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'prefer-const': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
  },
  settings: {
    ...createAliasSetting({
      '@': `${path.resolve(__dirname, './src')}`,
      '@assets': `${path.resolve(__dirname, './src/assets')}`,
    }),
  },
};
