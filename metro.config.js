const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// NativeWind 트랜스포머 설정
config.transformer.babelTransformerPath = require.resolve('nativewind/transformer');

module.exports = config; 