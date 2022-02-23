module.exports = {
  plugins: [
    "stylelint-scss"
  ],
  customSyntax: 'postcss-html',
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-prettier',
  ],
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  rules: {
    'at-rule-no-unknown': null,  // scssで使える@includeなどにエラーがでないようにする 
    'scss/at-rule-no-unknown': true, // scssでもサポートしていない@ルールにはエラーを出す
    'custom-property-no-missing-var-function': null,
  },
  ignoreFiles: ['**/node_modules/**'],
}
