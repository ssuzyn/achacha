module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 애니메이션을 위한 Reanimated 플러그인
      'react-native-reanimated/plugin',
    ],
  };
}; 