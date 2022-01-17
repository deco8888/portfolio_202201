const path = require('path');

module.exports = {
	reactStrictMode: true,
	distDir: "dist",
	sassOptions: {
		includePath: [path.join(__dirname, 'assets/styles')]
	}
};
