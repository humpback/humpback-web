const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
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
        use: ['awesome-typescript-loader?silent=true', 'angular2-template-loader']
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
        exclude: helpers.root('src', 'client', 'app'),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?sourceMap'
        })
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'client', 'app'),
        use: 'raw-loader'
      },
    ]
  },

  plugins: [
    new ProgressBarPlugin(),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      helpers.root('src', 'client')
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
