/** @type {import('postcss').Postcss} */
const config = {
    plugins: [
        'postcss-preset-env',
        // Flex Boxの記述方法によっては、ブラウザのバグによりうまく反映されない場合があるため、ブラウザのバグを防ぐ記述に変換する
        // "postcss-flexbugs-fixes",
        // ['postcss-preset-env',
        //     {
        //         "autoprefixer": {
        //             "flexbox": "no-2009",
        //             "grid": true
        //         },
        //         "stage": 3,
        //         // "features": {
        //         //     "custom-properties": false
        //         // }
        //     }]
    ],
};

module.exports = config;
