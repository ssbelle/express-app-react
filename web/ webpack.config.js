const path = require('path');

module.exports = {
  mode: 'development',
  entry: 'app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'final.js',
  },
  resolve: {
    extensions: ['.js'],
  },
  watchFiles: ["./**/*.{ejs,js}"],
  target: 'node',
};