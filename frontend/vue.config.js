const fs = require('fs')
const path = require('path')

// Local development may reuse the public client ID from the backend checkout.
// Production builds must provide their own frontend environment.
if (process.env.NODE_ENV !== 'production' && !process.env.VUE_APP_CLIENTID) {
  const backendEnvPath = path.resolve(__dirname, '../backend/.env')
  if (fs.existsSync(backendEnvPath)) {
    const clientIdLine = fs.readFileSync(backendEnvPath, 'utf8')
      .split(/\r?\n/)
      .find(line => line.startsWith('GOOGLE_CLIENT_ID='))
    if (clientIdLine) {
      process.env.VUE_APP_CLIENTID = clientIdLine.slice('GOOGLE_CLIENT_ID='.length).trim()
    }
  }
}

if (process.env.NODE_ENV === 'production' &&
    !/^[\w-]+\.apps\.googleusercontent\.com$/.test(String(process.env.VUE_APP_CLIENTID || '').trim())) {
  throw new Error('Production build requires a valid VUE_APP_CLIENTID. Set it in frontend/.env.production or the build environment.')
}

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  devServer: {
    disableHostCheck: true
  },
  configureWebpack: {
    //Necessary to run npm link https://webpack.js.org/configuration/resolve/#resolve-symlinks
    resolve: {
       symlinks: false
    }
  },
  transpileDependencies: [
    '@coreui/utils'
  ],
  // use this option for production linking
  // publicPath: process.env.NODE_ENV === 'production' ? '/vue/demo/3.0.0' : '/'
}
