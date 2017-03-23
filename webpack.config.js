var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var modules = [
  path.resolve('src'),
  'node_modules',
  'elm-stuff'
];

var entry = [
  'index.js'
];

var mod = {
  noParse: /\.elm$/,
  loaders: [
    {
      test:    /\.elm$/,
      exclude: [/elm-stuff/, /node_modules/],
      loader:  'elm-hot-loader!elm-webpack-loader?verbose=true&warn=true&debug=true'
    },
  ]
};

var plugins = [
  new HtmlWebpackPlugin({
    template: 'src/index.html',
    inject:   'body'
  })
];

module.exports = {
  entry: entry,
  resolve: {
    modules: modules
  },
  module: mod,
  plugins: plugins
};
