/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './dist/src/index.js',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'templates'),
                    to: path.resolve(__dirname, 'out/templates'),
                },
            ],
        }),
    ],
};
