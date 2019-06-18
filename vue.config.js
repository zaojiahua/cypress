// const BASE_URL = process.env.NODE_ENV === 'production' ? '/production/' : '/'
const BASE_URL = '/'

const path = require('path')

const resolve = dir => path.join(__dirname, dir)

module.exports = {
  lintOnSave: false,
  publicPath: BASE_URL,
  outputDir: 'cypress_vue',
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('_c', resolve('src/components'))
  },
  productionSourceMap: false
}
