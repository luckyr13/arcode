const path = require('path');

module.exports = {
  chainWebpack: config => {
    config
    .plugin('html')
    .tap(args => {
    args[0].title = 'ArCode Studio: Smartweave IDE';
      return args;
    });
    // Cool fix
    config.externals({ v8: {}, undici: {} });
  },
  publicPath: './',
  pwa: {
    name: 'ArCode Studio',
    workboxOptions: {
      exclude: ['index.html', /\.map$/],
      //navigateFallback: './'
    }
  },
  transpileDependencies: [ /codemirror/, /arweave\/web\/lib/ ]
}