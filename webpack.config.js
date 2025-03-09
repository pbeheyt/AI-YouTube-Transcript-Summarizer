const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    'youtube-content': './src/youtube-content.js',
    'claude-content': './src/claude-content.js',
    popup: './src/popup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  chrome: "88"
                },
                useBuiltIns: "usage",
                corejs: 3
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ],
    fallback: {
      "path": false,
      "fs": false
    }
  },
  optimization: {
    minimize: true
  },
  performance: {
    hints: false
  }
};