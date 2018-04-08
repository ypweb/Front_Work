/*内置插件*/
const path = require('path');
const glob = require('glob');
/*内置路径插件*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const autoprefixer = require('autoprefixer');


module.exports = {
    mode: 'none',
    /*入口文件*/
    entry: {
        'index': './src/js/index.js'
    },
    /*输出文件*/
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
    },
    /*模块加载配置*/
    module: {
        rules: [{
            test: /iconfont\.(ttf|woff|svg|eot)$/,
            use: [{
                loader: 'url-loader'
            }]
        }, {
            test: /\.(png|jpg|jpeg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 10,
                    outputPath: 'images/'
                }
            }]
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{loader:'css-loader'},
                    'postcss-loader',
                    'less-loader'
                ]
            })
        }]
    },
    /*插件*/
    plugins: [
        new autoprefixer({
            browsers: [
                'iOS>7',
                'Android>4',
                "> 1%",
                "last 5 versions",
                "not ie <= 8"
            ]
        }),
        new ExtractTextPlugin('base.css'),
        /* new OptimizeCssAssetsPlugin({
             assetNameRegExp: /\.css$/g,
             cssProcessor: require('cssnano'),
             cssProcessorOptions: {
                 discardComments: {
                     removeAll: true
                 }
             },
             canPrint: true
         }),*/
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './src/images/logo_icon.ico'
        }),
        /*new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, './!*.html'))/!*清除多余css todo*!/
        }),*/
        new copyWebpackPlugin([{
            from: __dirname + '/src/static',
            to: './static'
        }])
    ]
};