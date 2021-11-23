module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
      	args[0].title = 'arCode IDE: Arweave development tools';
        return args;
      })
  }
}