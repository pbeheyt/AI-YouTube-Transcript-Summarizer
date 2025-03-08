const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    'youtube-content': './src/youtube-content.js',
    'claude-content': './src/claude-content.js',
    'gpt-content': './src/gpt-content.js',
    popup: './src/popup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production', // or 'development' for debugging
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
                modules: false,
                targets: {
                  chrome: "88"
                }
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};