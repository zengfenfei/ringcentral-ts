const webpack = require("webpack");

module.exports = [/*{
    entry: "./build/src/Client.js",
    output: {
        path: "./build",
        filename: "ringcentral-client.js",
        library: "ringcentral",
        libraryTarget: "umd"
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
    ],
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
}, */{
        entry:[ "babel-polyfill", "./build/test/index.js"],
        output: {
            path: "./build",
            filename: "tests.js"
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader?presets[]=es2015'
                }
            ]
        },
        node: {
            fs: "empty"
        },
        plugins: [new webpack.optimize.UglifyJsPlugin({})]
    }];