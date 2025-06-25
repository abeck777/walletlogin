// next.config.js
const webpack = require('webpack');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks für Browser-Build
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        util: require.resolve('util/'),
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };

      // ProvidePlugin für globale Variablen
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    return config;
  },
};
// next.config.js
const webpack = require('webpack');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks für Browser-Build
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        util: require.resolve('util/'),
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };

      // ProvidePlugin für globale Variablen
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    return config;
  },
};
