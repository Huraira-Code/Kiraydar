module.exports = {
  presets: ['module:@react-native/babel-preset'],

  plugins: [
    'react-native-reanimated/plugin', // Reanimated plugin has to be listed last.

    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
      },
    ],
  ],
};
