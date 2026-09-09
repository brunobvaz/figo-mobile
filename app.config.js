// Set GOOGLE_SERVICES_JSON to the local/EAS file path for the matching Firebase Android app.
// iOS builds do not require this file.
module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins || []), ['react-native-maps', { ...(process.env.GOOGLE_MAPS_ANDROID_API_KEY ? { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY } : {}) }], ['expo-location', { locationWhenInUsePermission: 'A DaTerra usa a localização para encontrar produtos próximos e definir o local dos anúncios.' }]],
  android: {
    ...config.android,
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {})
  }
});
