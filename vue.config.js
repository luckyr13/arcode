module.exports = {
  chainWebpack: config => {
    config
    .plugin('html')
    .tap(args => {
    args[0].title = 'ArCode Studio: Smartweave IDE';
    return args;
    })
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