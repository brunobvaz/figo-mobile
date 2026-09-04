export default { 
    appName: 'DaTerra', 
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1', 
    defaultLocation: process.env.EXPO_PUBLIC_DEFAULT_LOCATION || 'Ponte de Lima', 
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'local',
    requestTimeout: 30000 
};
