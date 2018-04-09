/*内置插件*/
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

/*内置路径插件*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSWebpack = require('purifycss-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
    mode: 'development'/*development*//*'production'*//*'none'*/,
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
            test: /iconfont\.(ttf|woff|svg|eot)$/, /*解析字体图标--正常*/
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 200,
                    outputPath: 'fonts/'
                }
            }]
        }, {
            test: /^(iconfont)\.(ttf|woff|svg|eot)$//*解析非字体资源--正常*/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 100,
                    outputPath: 'images/'
                }
            }]
        }, {
            test: /\.(png|jpg|jpeg|gif)$/, /*测试图片资源--正常*/
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 100,
                    outputPath: 'images/'
                }
            }]
        }, {
            test: /\.(html|htm)$/, /*处理html中使用图片--正常*/
            use: ['html-withimg-loader']
        }, {
            test: /\.css$/, /*处理css-正常*/
            use: ExtractTextPlugin.extract({
                fallback:
                    'style-loader',
                use: [{
                    loader: 'css-loader',
                    options: {
                        autoprefixer: true
                    }
                },
                    'postcss-loader']
            })
        }, {
            test: /\.less$/, /*处理less*/
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'postcss-loader', 'less-loader']
            })
        }, {
            test: require.resolve('jquery'),
            use: [{
                loader: 'expose-loader',
                options: "$"
            }]
        }]
    },
    /*devServer:{
        contentBase:path.resolve(__dirname,'dist'),
        host:'localhost',
        compress:true,
        port:8095
    },*//*服务器配置*/
    /*插件*/
    plugins: [
        new CleanWebpackPlugin(['dist']), /*生成dist目录前先删除这个目录--正常*/
        new ExtractTextPlugin('base.css'), /*指定生成css文件--正常*/
        new OptimizeCssAssetsPlugin({
            astNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        }), /*压缩css--正常*/
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './src/images/logo_icon.ico'
        }), /*按结构生成相关html资源--正常*/
        /*new PurifyCSSWebpack({
            paths: glob.sync(path.join(__dirname, './!*.html'))
        }),*/ /*消除冗余代码--正常*/
        new CopyWebpackPlugin([{
            from: __dirname + '/src/static',
            to: './static'
        }])/*拷贝静态资源--正常*/,
        new webpack.ProvidePlugin({
            $:'jquery',
            jQuery:'jquery'
        })/*加载第三方资源--使应用程序能识别*/
    ],
    /*配置单独的资源引入页面*/
    optimization:{
        splitChunks:{
            cacheGroups:{
                resource_jquery:{
                    chunks:'initial',
                    name:'jquery',
                    enforce:true
                }
            }
        }
    }
};