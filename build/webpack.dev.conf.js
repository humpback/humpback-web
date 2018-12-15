const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonConfig = require('./webpack.base.conf');
const util = require('./util');

module.exports = webpackMerge(commonConfig, {
  devtool: 'inline-source-map',
  watch: true,
  mode: 'development',
  output: {
    path: util.root('dist', 'client'),
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].chunk.js'
  },

  plugins: [new MiniCssExtractPlugin({ filename: 'css/[name].css' })]
});
