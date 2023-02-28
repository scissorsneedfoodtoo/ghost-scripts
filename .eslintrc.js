module.exports = {
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: ['eslint:recommended', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {}
};
