module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
      	args[0].title = 'arCode IDE: Online smartweave contracts dev tools';
        return args;
      })
  }
}