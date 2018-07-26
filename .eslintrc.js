module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  globals: {
    window: true,
  },
  plugins: [
    'html',
  ],
  rules: {
    'no-new': 0,
    'no-param-reassign': 0,
    'import/prefer-default-export': 0,
	'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  },
};
