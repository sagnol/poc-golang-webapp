'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);


const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

module.exports = {
  entry: {
    index: [resolveApp('./src/pages/index')]
  },
  output: {
    filename: '[name].[hash].bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  resolve: {
    extensions: moduleFileExtensions.map(ext => `.${ext}`)
  },
  module: {
    strictExportPresence: true,
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      { parser: { requireEnsure: false } },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          /* devMode ? 'style-loader' : */
          MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              useRelativePath: true,
              limit: 10000
            }
          }
        ]
      },
      {
        oneOf: [
          // TODO: Merge this config once `image/avif` is in the mime-db
          // https://github.com/jshttp/mime-db
          {
            test: [/\.avif$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              mimetype: 'image/avif',
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // Process application JS with swc via swc-loader.
          // The preset includes JSX, Flow, TypeScript, and some ESnext features.
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: require.resolve('swc-loader'),
              // see .swcrc
            },
          },
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
    new HtmlWebpackPlugin({
      publicPath: "ui/dist",
      template: resolveApp("../../templates/index.html")
    })
  ]
}
