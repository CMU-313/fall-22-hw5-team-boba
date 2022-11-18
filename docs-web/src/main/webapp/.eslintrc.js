module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    camelcase: 0,
    'guard-for-in': 0,
    'prefer-spread': 0,
    'new-cap': 0,
    'no-invalid-this': 0,
    'no-unused-vars': 0,
    'no-var': 0,
    'prefer-const': 0,
    'prefer-rest-params': 0,
    'require-jsdoc': 0,
    'valid-jsdoc': 0,
  },
};
