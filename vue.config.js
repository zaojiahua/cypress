// const BASE_URL = process.env.NODE_ENV === 'production' ? '/production/' : '/'
const BASE_URL = '/'

const path = require('path')

const resolve = dir => path.join(__dirname, dir)

module.exports = {
  lintOnSave: false,
  publicPath: BASE_URL,
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('_c', resolve('src/components'))
      .set('api', resolve('src/api'))
      .set('lib', resolve('src/lib'))
  },
  productionSourceMap: false
}
