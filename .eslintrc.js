// TypescriptでESLintルールを作るときに @typescript-eslint/experimental-utils を使うと便利
/** @type {import('@typescript-eslint/experimental-utils').TSESLint.Linter.Config} */
module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    extends: ['@nuxtjs/eslint-config-typescript', 'plugin:nuxt/recommended', 'prettier'],
    plugins: [],
    // add your custom rules here
    rules: {
        'vue/multi-word-component-names': 'off',
        'lines-between-class-members': 'off',
        'eslint-disable-next-line': 'off',
    },
};
