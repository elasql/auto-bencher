module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha:true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    "semi":[2, "always"],
    "quotes":[2, "single", {
      "avoidEscape": true,
      "allowTemplateLiterals": true
    }],
    "indent": ["error", 2]
  }
}
