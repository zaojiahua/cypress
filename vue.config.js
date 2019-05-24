const BASE_URL = process.env.NODE_ENV === 'production' ? '/production/' : '/'

const path = require('path')

const resolve = dir => path.join(__dirname, dir)

module.exports = {
  lintOnSave: false,
  publicPath: BASE_URL,
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('_c', resolve('src/components'))

    // config.module // need installiview-loader
    //   .rule('vue')
    //   .use('iview')
    //   .loader('iview-loader')
    //   .options({ prefix: false })
  },
  productionSourceMap: false
}
