const fs = require('fs')
const path = require('path')

const DEFAULT_GOOGLE_CLIENT_ID = '225788483142-8pkg8on8nh60ao83ve33ff3lflv2ccvo.apps.googleusercontent.com'

// Ensure public Google OAuth Client ID is always available to the frontend bundle
if (!process.env.VUE_APP_CLIENTID) {
  const candidateEnvPaths = [
    path.resolve(__dirname, '.env.production'),
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../backend/.env'),
    path.resolve(__dirname, '../.env.production'),
    path.resolve(__dirname, '../.env')
  ]

  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.split(/\r?\n/).find(l => l.startsWith('GOOGLE_CLIENT_ID=') || l.startsWith('VUE_APP_CLIENTID='))
      if (match) {
        process.env.VUE_APP_CLIENTID = match.split('=')[1].trim().replace(/^["']|["']$/g, '')
        break
      }
    }
  }

  if (!process.env.VUE_APP_CLIENTID) {
    process.env.VUE_APP_CLIENTID = DEFAULT_GOOGLE_CLIENT_ID
  }
}

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  devServer: {
    disableHostCheck: true,
    watchOptions: {
      ignored: /node_modules/
    }
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
