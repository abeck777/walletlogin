// next.config.js
const webpack = require('webpack');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        util:    require.resolve('util/'),
        assert:  require.resolve('assert/'),
        stream:  require.resolve('stream-browserify'),
        crypto:  require.resolve('crypto-browserify'),
        buffer:  require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        url:     require.resolve('url/'),
        http:    require.resolve('stream-http'),
        https:   require.resolve('https-browserify'),
        os:      require.resolve('os-browserify/browser'),    // ← hier neu
      };

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
