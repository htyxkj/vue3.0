module.exports = {
  publicPath: './',
  outputDir: 'dist/',
  assetsDir: 'static',
  lintOnSave: true,
  //关键点在这  
  runtimeCompiler: true,
  productionSourceMap:false,//不生成 js.map 文件

  // 调整内部的 webpack 配置。
  // 查阅 https://github.com/vuejs/vue-doc-zh-cn/vue-cli/webpack.md
  chainWebpack: () => {},

  configureWebpack: () => {},

  // 配置 webpack-dev-server 行为。
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8082,
    https: false,
    hotOnly: false,
    // 查阅 https://github.com/vuejs/vue-doc-zh-cn/vue-cli/cli-service.md#配置代理
    proxy: null, // string | Object
    before: app => {}
  },

  pluginOptions: {
    moment: {
      locales: [
        'zh_CN'
      ]
    }
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/assets/scss/_mixin.scss";`
      }
    }
  }
}
