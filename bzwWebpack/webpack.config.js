/*内置插件*/
const path = require('path');
const glob = require('glob');
/*内置路径插件*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    // mode: "production", /*打包模式*/
    /*入口文件*/
    entry: {
        'index': './src/js/index.js'
    },
    /*输出文件*/
    output: {
        filename: 'bundle.js'/*输出文件名*/,
        path: path.resolve(__dirname, './dist')/*输出文件夹*/
    },
    /*模块加载配置*/
    module: {
        rules: [{
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader']
            })
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'less-loader']
            })
        }, {
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
        }]
    },
    /*插件*/
    plugins: [
        new ExtractTextPlugin('base.css')/*分离css文件*/,
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './src/images/logo_icon.ico'
        })/*自定义生成html文件*/,
        new copyWebpackPlugin([{
            from: __dirname + '/src/static',//打包的静态资源目录地址
            to: './static' //打包到dist下面的public
        }])
    ]
};