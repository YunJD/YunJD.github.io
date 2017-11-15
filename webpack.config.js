const path = require('path');
const webpack = require('webpack');
 
module.exports = {
    entry: {
        App: './_src/jsx/app.jsx'
    },
    output: { 
        path: __dirname + '/scripts/js', filename: '[name].js', library: 'App', libraryTarget: 'var'
    },
    module: {
        rules: [
            { 
                test: /\.(glsl|vert|frag)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'glsl-template-loader'
                }
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    },
                }
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname + '/_src/jsx'),
            path.resolve(__dirname + '/node_modules'),
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ]
};
