/* eslint-disable @typescript-eslint/no-var-requires */
const rules = require('./webpack.rules');

rules.push({
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
    // Put your normal webpack config below here
    module: {
        rules,
    },
    resolve: {
        fallback: {
            stream: require.resolve('stream-browserify'),
        },
    },
};
