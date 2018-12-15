const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpackMerge = require('webpack-merge');
const util = require('./util');

module.exports = webpackMerge(
  {},
  {
    entry: {
      angular2: './src/client/angular2.ts',
      app: './src/client/main.ts'
    },
    mode: 'none',
    resolve: {
      extensions: ['.ts', '.js']
    },

    performance: {
      hints: false
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ['ts-loader', 'angular2-template-loader']
        },
        {
          test: /\.html$/,
          use: 'html-loader'
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/,
          use: 'file-loader?name=static/images/[name].[ext]'
        },
        {
          test: /\.(woff|woff2|ttf|eot)$/,
          use: 'file-loader?name=static/fonts/[name].[ext]'
        },
        {
          test: /\.css$/,
          exclude: util.root('src', 'client', 'app'),
          use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader']
        },
        {
          test: /\.css$/,
          include: util.root('src', 'client', 'app'),
          use: 'raw-loader'
        }
      ]
    },
    plugins: [
      new ProgressBarPlugin(),
      new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)@angular/, util.root('src', 'client')),
      new HtmlWebpackPlugin({
        template: 'src/client/index.html'
      }),
      new CopyWebpackPlugin([
        {
          from: 'src/client/static',
          to: 'static'
        },
        {
          from: 'src/client/*.html',
          ignore: 'index.html',
          to: '[name].html'
        }
      ])
    ]
  }
);
