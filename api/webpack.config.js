const slsw = require('serverless-webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const serviceAccountPath = './src/services/googleContent/serviceAccount.json';
module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
    }, ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // we bundle js for node modules
  },
  externals: ['aws-sdk', /aws-sdk\/clients\/.*/],
  plugins: [],
};