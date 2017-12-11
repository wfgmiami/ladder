const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client',
    path.join(__dirname, '/browser/react/index.js')
  ],
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'bundle.js',
    publicPath: '/dev'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0', 'react-hmre']
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  resolve: {
    alias: {
      app: browserPath(''),
      reducers: browserPath('redux/reducers'),
      components: browserPath('react/components'),
      containers: browserPath('react/containers'),
      colorCSS: browserPath('react/colorCSS'),
      theme: browserPath('react/theme'),
      utils: browserPath('redux/utils'),
      assets: browserPath('assets')
    }
  }
};

function browserPath(txt) {
  return path.join(__dirname, `/browser/${txt}`);
}
