// https://cli.vuejs.org/zh/config/
const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: '',
  configureWebpack (config) {
    if (process.env.NODE_ENV === 'development') {
      // config.devtool = 'source-map'
    }
    config.resolve.alias['~'] = resolve('src/views')
  },
  chainWebpack (config) {
    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icon'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icon'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  devServer: {
    proxy: {
      [process.env.VUE_APP_API_PREFIX]: {
        // target: process.env.VUE_APP_API_HOST,
        // target: 'http://192.168.0.185:8082',
        // target: 'http://192.168.0.173:8080',
        // target: 'http://mw.mock.server.ywzhou.shop',
        target: 'http://x1test.jeecms.com',
        // changeOrigin: true,
        autoRewrite: true,
        cookieDomainRewrite: {
          "*": ""
        },
        pathRewrite: {
          ['^' + process.env.VUE_APP_API_PREFIX]: ''
        }
      }
    }
  }
}
