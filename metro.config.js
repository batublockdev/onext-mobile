const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    url: require.resolve('react-native-url-polyfill'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    events: require.resolve('events/'),
    util: require.resolve('util/'),
};

module.exports = config;
