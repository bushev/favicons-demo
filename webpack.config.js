const path = require('path');
const {platform} = require('os');
const {execSync} = require('child_process');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './index.ts',
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: path.resolve(__dirname, 'node_modules')
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: './node_modules/sharp/vendor/lib', to: 'lib'},
        {
          from: './node_modules/favicons/dist/mask.png'
        },
        {
          from: './node_modules/favicons/dist/overlay-glow.png'
        },
        {
          from: './node_modules/favicons/dist/overlay-shadow.png'
        },
        {
          from: './test', to: 'test'
        }
      ]
    }),
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {

          if (platform() === 'darwin') {
            console.log(execSync(`install_name_tool -add_rpath "@loader_path/lib" ${compilation.options.output.path}/*.node`).toString());
          } else if (platform() === 'linux') {
            console.log(execSync(`chrpath -r '$ORIGIN/lib' ${compilation.options.output.path}/*.node`).toString());
          } else {
            throw new Error(`Platform "${platform()}" not supported`)
          }
        });
      }
    }
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  optimization: {
    minimize: false
  },
  stats: 'errors-warnings',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  }
};
