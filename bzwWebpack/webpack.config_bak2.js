//var webpack = require('webpack');
/*内置插件*/
const path = require('path');/*内置路径插件*/

/*const HtmlWebpackPlugin = require('html-webpack-plugin');*//*自动引用资源文件插件*/
/*const MiniCssExtractPlugin = require("mini-css-extract-plugin");*//*抽离css样式,防止将样式打包在js中*/


module.exports = {
    /*入口文件*/
    entry: './src/js/index.js',
    /*输出文件*/
    output: {
        filename: 'bundle.js'/*输出文件名*/,
        path: path.resolve(__dirname, '/dist')/*输出文件夹*/
    },
    /*模块加载配置*/
    module: {
        /*rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },{
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader']
        },{
            test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
            use: ['file-loader?name=src/[name].[hash].[ext]']
        }]*/
    },
    /*插件*/
    plugins: [/*new webpack.optimize.UglifyJsPlugin(), *//*使用压缩工具*/
        /*new MiniCssExtractPlugin({
            filename: "base.css",
        })*//*new ExtractTextPlugin("base.css")*/,/*生成css文件*/
        /*new HtmlWebpackPlugin()*//*自动帮你生成一个html 文件，并且引用相关的 assets资源文件*/]
};