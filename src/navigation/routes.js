export const ROUTES = {
    WELCOME: 'Welcome', 
    LOGIN: 'Login', 
    REGISTER: 'Register',
    REGISTER_DETAILS: 'RegisterDetails',
    OTP_VERIFICATION: 'OtpVerification',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
    HOME: 'HomeTab', 
    EXPLORE: 'ExploreTab', 
    SELL: 'SellTab', 
    MY_PRODUCTS: 'MyProducts',
    FAVORITES: 'FavoritesTab', 
    PROFILE: 'ProfileTab', 
    PRODUCT_DETAILS: 'ProductDetails', 
    EDIT_PRODUCT: 'EditProduct',
    CONVERSATIONS: 'Conversations',
    CHAT: 'Chat',
    SELLER_PROFILE: 'SellerProfile', 
    EDIT_PROFILE: 'EditProfile', 
    SEASONAL_RECIPES: 'SeasonalRecipesScreen',
    FAIRS_EVENTS: 'FairsEventsScreen',
    ORDERS: 'Orders' 
};

/**
 * Home -> Explore uses route.params.filters (replaced on every shortcut).
 * @typedef {Object} ExploreFilters
 * @property {string} [query]
 * @property {string} [category]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {number} [radiusKm]
 * @property {'distance'|'recent'|'price_asc'|'price_desc'} [sortBy]
 * @property {boolean} [seasonal]
 * @property {boolean} [featured]
 * @property {boolean} [availableOnly]
 * @property {string} [sellerId]
 * @property {string} [unit]
 * @property {'pickup'|'delivery'} [deliveryType] Reserved until supported by backend.
 * @property {'list'|'map'} [viewMode]
 */
