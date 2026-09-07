// Set GOOGLE_SERVICES_JSON to the local/EAS file path for the matching Firebase Android app.
// iOS builds do not require this file.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {})
  }
});
