module.exports = {
  root: true, // .eslintrc.jsがプロジェクトのルートに配置させているか
  env: {
    browser: true, // ブラウザで実行されるコードを検証
    node: true,
  },
  parser: '@typescript-eslint/parser', // ESLintにTypeScriptを理解させる
  parserOptions: {
    sourceType: 'module', // ES Modules機能を有効
    ecmaVersion: 2020, // ECMAScript 2020
  },
  extends: [
    'next',
    'next/core-web-vitals',
    // 'plugin:@typescript-eslint/eslint-recommended', // eslint:recommendedに含まれるルールを型チェックでカバーできるものは無効化
    // 'plugin:@typescript-eslint/recommended', // 型チェックが不要なルールを適用
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-var-requires': 0,
  },
};
