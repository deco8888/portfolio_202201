module.exports = {
    plugins: ['stylelint-scss'],
    extends: [
        'stylelint-config-recommended-scss',
        // stylelintのPrettierと重複するルールをオフする
        'stylelint-config-prettier',
    ],
    rules: {
        'at-rule-no-unknown': null, //scssで使える @include などにエラーがでないようにする
        'scss/at-rule-no-unknown': true, //scssでもサポートしていない @ルール にはエラーを出す
    },
    ignoreFiles: ['**/node_modules/**'],
};
