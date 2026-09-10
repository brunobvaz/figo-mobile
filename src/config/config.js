import { resolveApiUrl } from './apiUrl';

export default { 
    appName: 'DaTerra', 
    apiBaseUrl: resolveApiUrl(process.env.EXPO_PUBLIC_API_BASE_URL, __DEV__), 
    defaultLocation: process.env.EXPO_PUBLIC_DEFAULT_LOCATION || 'Ponte de Lima', 
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'local',
    requestTimeout: 30000 
};
