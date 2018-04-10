'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}


module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/, /*加载vue文件*/
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/, /*加载js文件*/
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /iconfont\.(ttf|woff|svg|eot)$/, /*处理字体图标字体文件*/
        loader: 'url-loader',
        options: {
          limit: 200,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /^(iconfont)\.(ttf|woff|svg|eot)$/, /*处理非字体图标字体文件*/
        loader: 'url-loader',
        options: {
          limit: 5000,
          name: utils.assetsPath('images/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/, /*处理图片文件*/
        loader: 'url-loader',
        options: {
          limit: 5000,
          name: utils.assetsPath('images/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, /*处理视频，音频文件*/
        loader: 'url-loader',
        options: {
          limit: 5000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      }, {
        test: /\.(html|htm)$/, /*处理html中使用图片--正常*/
        loader: 'html-withimg-loader'
      }, {
        test: /\.css$/, /*处理css-正常*/
        loader:'style-loader!css-loader!postcss-loader'
      }, {
        test: /\.less$/, /*处理less*/
        loader:'style-loader!css-loader!less-loader'
      }
    ]
  },
  node: {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
