//var webpack = require('webpack');
/*内置插件*/
var path = require('path');/*内置路径插件*/

/*var HtmlWebpackPlugin = require('html-webpack-plugin');*//*自动引用资源文件插件*/
//var ExtractTextPlugin = require('extract-text-webpack-plugin')/*抽离css样式,防止将样式打包在js中*/;


var webpackConfig = {
    /*入口文件*/
    entry: 'src/js/index.js',
    /*输出文件*/
    output: {
        filename: 'bundle.js'/*输出文件名*/,
        path: path.resolve(__dirname, '/dist')/*输出文件夹*/
    },
    /*模块加载配置*/
    module: {
        /*规则*/
        rules: [/*1:处理css文件*/
            /*{
                test: /\.css$/,
                use: [
                    {
                        /!*a:内联样式类型*!/
                        loader: ['style-loader']('/loaders/style-loader')
                    }, {
                        /!*b:外链css文件形式类型*!/
                        loader: ['css-loader']('/loaders/css-loader'),
                        options: {
                            modules: true
                        }
                    }
                ]
            },*/
            /*2:处理less*/
            /*{
                test: /\.(less|css)$/,
                use: ExtractTextPlugin.extract({
                    use:[ 'less-loader']/!*编译源文件的类型*!/,
                    fallback: 'style-loader'
                })
            },*/
            /*3:处理js*/
            /*{
                test: /\.(js|jsx)$/,
                use: ['babel-loader']
            }*/]
    },
    /*插件*/
    plugins: [/*new webpack.optimize.UglifyJsPlugin(), *//*使用压缩工具*/
        /*new ExtractTextPlugin("base.css"),*//*生成css文件*/
        /*new HtmlWebpackPlugin()*//*自动帮你生成一个html 文件，并且引用相关的 assets资源文件*/]
};