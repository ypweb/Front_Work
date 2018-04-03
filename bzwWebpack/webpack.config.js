/*内置插件*/
const path = require('path');
const glob = require('glob');
/*内置路径插件*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
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
                use: ['css-loader?importLoaders=2!postcss-loader']
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
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'less-loader']
            })
        }]
    },
    postcss:{

    },
    /*插件*/
    plugins: [
        new ExtractTextPlugin('base.css')/*分离css文件*/,
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        })/*压缩css*/,
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './src/images/logo_icon.ico'
        })/*自定义生成html文件*/,
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, './*.html'))/*清除多余css todo*/
        }),
        new copyWebpackPlugin([{
            from: __dirname + '/src/static',//打包的静态资源目录地址
            to: './static' //打包到dist下面的public
        }])
    ]
};