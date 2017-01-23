const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const helpers = require('./helpers');

module.exports = {
  entry: {
    'angular2': './src/client/angular2.ts',
    'app': './src/client/main.ts'
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  performance: {
    hints: false
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader', 'angular2-template-loader']
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/,
        loader: 'file-loader?name=static/images/[name].[ext]'
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        loader: 'file-loader?name=static/fonts/[name].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'client', 'app'),
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader?sourceMap'
        })
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'client', 'app'),
        loader: 'raw-loader'
      },
    ]
  },

  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      helpers.root('src', 'client'),
      {}
    ),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'angular2']
    }),
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
};
