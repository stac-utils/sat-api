const path = require('path')
const ZipPlugin = require('zip-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

let mode = 'development'
let devtool = 'inline-source-map'

if (process.env.PRODUCTION) {
  mode = 'production'
  devtool = false
}

module.exports = {
  mode,
  entry: './index.js',
  output: {
    libraryTarget: 'commonjs2',
    filename: 'index.js',
    path: path.resolve(__dirname, '..', '..', '..', 'dist', 'api')
  },
  externals: [
    'aws-sdk'
  ],
  devtool,
  optimization: {
    usedExports: true
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: 'openapi.yaml',
        to: 'openapi.yaml'
      },
      {
        from: 'redoc.html',
        to: 'redoc.html'
      }
    ]
    }),
    new ZipPlugin({
      filename: 'api.zip'
    })
  ]
}
