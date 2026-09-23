// Set GOOGLE_SERVICES_JSON to the local/EAS file path for the matching Firebase Android app.
// iOS builds do not require this file.
module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins || []), ...(process.env.GOOGLE_MAPS_ANDROID_API_KEY ? [['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }]] : []), ['expo-location', { locationWhenInUsePermission: 'A Figo usa a tua localização para encontrar produtos próximos e obter direções para eventos.' }]],
  extra: { ...config.extra, googleMapsAndroidConfigured: Boolean(process.env.GOOGLE_MAPS_ANDROID_API_KEY) },
  android: {
    ...config.android,
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {})
  }
});
