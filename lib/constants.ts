export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Bakabit'
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Bakabit Utility App'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.bakabit.com'

export const APP_AUTH_CALLBACK_URI = process.env.NEXT_PUBLIC_AUTH_CALLBACK_URI || '/api/auth/callback';
export const APP_AUTH_LOGIN_URI = process.env.NEXT_PUBLIC_AUTH_LOGIN_URI || '/auth/login';
export const APP_LANDING_PAGE_URI = process.env.NEXT_PUBLIC_LANDING_PAGE_URI || '/dashboard';

export const APP_AUTH_CALLBACK_URL = APP_URL + APP_AUTH_CALLBACK_URI;
export const APP_AUTH_LOGIN_URL = APP_URL + APP_AUTH_LOGIN_URI;
export const APP_LANDING_PAGE_URL = APP_URL + APP_LANDING_PAGE_URI;

export const APP_SUPPORT_MAILTO = process.env.NEXT_PUBLIC_APP_SUPPORT_MAILTO || 'support@bakabit.com';
export const APP_SESSION_COOKIE_NAME = process.env.NEXT_PUBLIC_APP_SESSION_COOKIE_NAME || 'BAKA_SESSION';

export const APP_OPENAI_VERIFICATION_TOKEN = process.env.NEXT_PUBLIC_OPENAI_VERIFICATION || '';