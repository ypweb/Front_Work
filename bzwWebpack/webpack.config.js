/*内置插件*/
const path = require('path');
const glob = require('glob');
/*内置路径插件*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSWebpack = require('purifycss-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin=require('clean-webpack-plugin');
/*const autoprefixer = require('autoprefixer');*/


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
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'postcss-loader']
            })
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'less-loader']
            })
        }]
    },
    /*插件*/
    plugins: [
        new CleanWebpackPlugin(['dist']),/*生成dist目录前先删除这个目录--正常*/
        new ExtractTextPlugin('base.css'),/*指定生成css文件--正常*/
        /*require('autoprefixer'),*/
        /*new autoprefixer({
            browsers: [
                "> 1%",
                "last 5 versions",
                "not ie <= 8"
            ]
        }),*/
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './src/images/logo_icon.ico'
        }),/*按结构生成相关html资源--正常*/
        new PurifyCSSWebpack({
            paths: glob.sync(path.join(__dirname, '*.html'))
        }),/*消除冗余代码--正常*/
        new CopyWebpackPlugin([{
            from: __dirname + '/src/static',
            to: './static'
        }])/*拷贝静态资源--正常*/
    ]
};