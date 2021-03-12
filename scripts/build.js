const webpack = require('webpack');
const config = require('../config/webpack.config');


const compiler = webpack(config);
compiler.run((err, stats) => {
	console.log(err,stats);
});
