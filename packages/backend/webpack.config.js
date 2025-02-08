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
                {
                    from: path.resolve(__dirname, 'package.json'),
                    to: path.resolve(__dirname, 'out/package.json'),
                },
                {
                    from: path.resolve(__dirname, 'migrate.js'),
                    to: path.resolve(__dirname, 'out/migrate.js'),
                },
                {
                    from: path.resolve(__dirname, 'migrations'),
                    to: path.resolve(__dirname, 'out/migrations'),
                },
            ],
        }),
    ],
};
