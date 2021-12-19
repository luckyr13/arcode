module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
      	args[0].title = 'ArCode Studio: Online Arweave IDE';
        return args;
      })
  },
  publicPath: './',
  pwa: {
  	name: 'arCode Studio',
    workboxOptions: {
    	exclude: ['index.html', /\.map$/],
    	//navigateFallback: './'
		}
	}
}