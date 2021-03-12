'use strict';

const fs = require('fs');
const path = require('path');
//const webpack = require('webpack');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
//console.log(resolveApp('src/index.ts'),resolveApp('dist'))
module.exports = {
	target: 'node',
	mode: 'production',

	entry: resolveApp('src/index.ts'),
	output: {
		path: resolveApp('dist'),
		filename: 'index.js',
		library: 'scanner',
		libraryTarget: 'umd'
	},
	externals: {
		jsqr: {
			commonjs: 'jsqr',
			commonjs2: 'jsqr',
		},
		jimp: {
			commonjs: 'jimp',
			commonjs2: 'jimp',
		}
	},

	resolve: {
		extensions: ['.js', '.ts'],
	},

	module: {
		rules: [
			{
				test: /\.(js|mjs|jsx|ts|tsx)$/,
				include: resolveApp('src'),
				loader: require.resolve('babel-loader'),
				options: {
					presets: [
						require.resolve('@babel/preset-env'),
						require.resolve('@babel/preset-typescript')

					],

					plugins: [
						require.resolve('@babel/plugin-proposal-class-properties'),
						require.resolve('@babel/plugin-proposal-object-rest-spread'),
						require.resolve('@babel/plugin-transform-runtime')
					],

					cacheDirectory: true,
					cacheCompression: false,
					compact: false,
				},
			},
		]
	}
};
