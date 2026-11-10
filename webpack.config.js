var path = require('path');

module.exports = {
  context: __dirname,
  entry: ['../../dist/apps/MEO/main.js', '../../dist/apps/MEO/209.js', '../../dist/apps/MEO/655.js', '../../dist/apps/MEO/130.js'],
  output: {
    path: path.join(__dirname, '../../dist/apps/MEO'),
    publicPath: '',
    filename: 'wm-main.bundle.js'
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  mode: 'production'
};
