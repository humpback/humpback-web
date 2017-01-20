var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  devtool: 'inline-source-map',
  watch: true,

  output: {
    path: helpers.root('dist', 'client'),
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].chunk.js'
  },

  plugins: [
    new ExtractTextPlugin('css/[name].css')
  ]
});
