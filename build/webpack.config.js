const { resolve } = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const packageJSON = require('../package.json');

const MultiLibPlugin = require('./multi-lib-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'apidevtools.swagger-parser': resolve(process.cwd(), './src/lib/apidevtools.swagger-parser.ts')
  },
  output: {
    path: resolve(process.cwd(), './lib'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
    environment: {
      // 关闭输出头部代码使用const关键字
      const: false,
      // 关闭输出头部代码使用箭头函数
      arrowFunction: false
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': resolve(process.cwd(), './src'),
      '@root': resolve(process.cwd(), './')
    },
    fallback: {
      // util: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify')
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            target: 'ES5',
          }
        }
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // 不将注释提取到单独的文件中
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new MultiLibPlugin({
      mainDirectory: 'src/lib'
    }),
    new webpack.BannerPlugin(
      `${packageJSON.name} v${packageJSON.version}
(c) 2023-present ${packageJSON.author.name}
Released under the MIT License.`
    ),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      process: {
        env: {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
          // 在浏览器环境中，process.env 属性可能并不存在，因此您可以手动定义这些属性：
          APP_ENV: JSON.stringify('browser')
        },
        cwd: function () {
          return '';
        }
      }
    })
  ]
};
