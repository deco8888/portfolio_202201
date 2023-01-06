import type { NuxtConfig } from '@nuxt/types';
import { Configuration } from '@nuxt/types/node_modules/@types/webpack';
import Sass from 'sass';

const environment = process.env.NODE_ENV || 'development';
const isDev = environment === 'development';

const nuxtConfig: NuxtConfig = {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    render: {
        crossorigin: 'use-credentials',
    },

    // Target: https://go.nuxtjs.dev/config-target
    target: 'static',
    srcDir: 'src/',

    generate: {
        // 404.htmlが作成される
        fallback: true,
    },

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'portfolio_202201',
        htmlAttrs: {
            lang: 'ja',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' },
            { name: 'format-detection', content: 'telephone=no' },
            // {name: '', content: ''}
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
            {
                rel: 'stylesheet',
                href: 'https://api.fontshare.com/v2/css?f[]=nippo@700&display=swap',
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@900&display=swap',
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@700&family=Red+Hat+Display&display=swap',
            },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css?family=M+PLUS+1p',
            },
        ],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['ress', '~/assets/styles/app.scss'],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [{ src: '~/plugins/scroll', mode: 'client' }],

    router: {
        base: process.env.BASE_URL || '',
        // scrollBehavior: function (_to, _from, _savedPosition) {
        //     return { x: 0, y: 0 };
        // },
    },

    publicRuntimeConfig: {
        url: process.env.URL || '',
        baseUrl: process.env.BASE_URL || '',
    },

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: false,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // コンポーネント内でもグローバルにあるSassファイルの変数やmixinが使えるようになる
        '@nuxtjs/style-resources',
        // https://go.nuxtjs.dev/typescript
        '@nuxt/typescript-build',
        // https://go.nuxtjs.dev/stylelint
        '@nuxtjs/stylelint-module',
        '@nuxt/postcss8',
    ],

    // loading: '~/components/Loading.vue',

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [],

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        // transpile: ['three'],
        babel: {
            // コンパイルに必要なプラグインのリストをBabel本体に渡す役割
            presets({ isServer }: any) {
                return [
                    [
                        // require.resolve : look up the location of module
                        // @nuxt/babel-preset-app: a wrapper around the @babel/preset-env preset
                        // babel: ES2020をES5に変換
                        require.resolve('@nuxt/babel-preset-app'),
                        {
                            // passed in through the Builder, either "server" or "client"
                            buildTarget: isServer ? 'server' : 'client',
                            // 必要なpolyfillのみ入れる
                            // polyfill: ES5に存gi在しない関数やライブラリの代替コード
                            useBuiltIns: 'usage',
                            // polyfillを利用するcore-jsのバージョンを指定
                            corejs: {
                                version: 3.21,
                            },
                        },
                    ],
                ];
            },
            compact: true,
        },
        // webpackの設定を拡張
        extend(config: Configuration, { isClient }: any) {
            if (isClient) {
                config.devtool = isDev ? 'source-map' : false;
            }
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!config.module) {
                config.module.rules.push({
                    test: /\.(vert|frag|glsl)$/i,
                    use: ['raw-loader', 'glslify-loader'],
                });
            }
        },
        // isModern：自動的に解決
        filenames: {
            app: ({ isModern }) =>
                isDev
                    ? `[name]${isModern ? '.modern' : ''}.js`
                    : `[name]${isModern ? '.modern' : ''}.[contenthash:7].js`,
            chunk: ({ isDev }) => (isDev ? '[name].js' : '[id].[contenthash].js'),
            // chunk: ({ isDev, isModern }) =>
            //     isDev
            //         ? `[name]${isModern ? '.modern' : ''}.js`
            //         : `[name]${isModern ? '.modern' : ''}.[contenthash:7].js`,
            css: () => (isDev ? '[name].css' : '[name].[contenthash:7].css'),
            img: () => (isDev ? '[path][name].[ext]' : '[path][name].[contenthash:7].[ext]'),
            font: () => (isDev ? '[path][name].[ext]' : '[path][name].[contenthash:7].[ext]'),
            video: () => (isDev ? '[path][name].[ext]' : '[path][name].[contenthash:7].[ext]'),
        },
        // HTMLファイルを最小化
        html: {
            minify: {
                // checked="checked"、disabled="disabled"などのブール属性から、属性値を除外します
                collapseBooleanAttributes: true,
                // インラインタグの周囲の空白を削除
                collapseInlineTagWhitespace: true,
                // タグ間の空白を削除
                collapseWhitespace: true,
                // 文字実体参照をデコードします
                decodeEntities: true,
                minifyCSS: true,
                minifyJS: true,
                // 条件付きコメント内で軽量化
                processConditionalComments: true,
                // 空の属性を削除
                removeEmptyAttributes: true,
                // 値がHTML仕様のデフォルトと一致するとき、属性を削除
                removeRedundantAttributes: true,
                // DOCTYPE宣言を小文字に変換
                useShortDoctype: true,
                // ignoreCustomFragmentsの周囲の空白を削除
                trimCustomFragments: true,
                removeComments: true,
            },
        },
        loaders: {
            scss: {
                implementation: Sass,
                // sassOptions: {
                //     fibers: Fibers,
                // },
            },
        },
        postcss: {
            preset: {
                autoprefixer: {
                    grid: false,
                    cascade: false,
                },
            },
        },
        terser: {
            terserOptions: {
                // uglifyjsのconsole.xを消すオプション
                compress: { drop_console: false },
            },
        },
    },
};

export default nuxtConfig;
