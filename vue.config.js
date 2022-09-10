const path = require('path');
const webpack = require('webpack');

module.exports = {
  chainWebpack: config => {
    config
    .plugin('html')
    .tap(args => {
    args[0].title = 'ArCode Studio: Smartweave IDE';
      return args;
    });
    // Cool fix
    config.externals({ v8: {}, undici: {}, crypto: {}, constants: {} });
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
      }),
    ]
  },
  publicPath: './',
  pwa: {
    name: 'ArCode Studio',
    workboxOptions: {
      exclude: ['index.html', /\.map$/],
      //navigateFallback: './'
    }
  }
}