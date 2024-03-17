export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Bakabit';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Bakabit Utility App';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.bakabit.com';

export const APP_AUTH_CALLBACK_URI = process.env.NEXT_PUBLIC_AUTH_CALLBACK_URI || '/auth/callback';
export const APP_AUTH_LOGIN_URI = process.env.NEXT_PUBLIC_AUTH_LOGIN_URI || '/auth/login';
export const APP_LANDING_PAGE_URI = process.env.NEXT_PUBLIC_LANDING_PAGE_URI || '/dashboard';

export const APP_LEGAL_PRIVACY_POLICY_URI = process.env.NEXT_PUBLIC_LEGAL_PRIVACY_POLICY_URI || '/legal/privacy-policy';
export const APP_LEGAL_TOS_URI = process.env.NEXT_PUBLIC_LEGAL_TERMS_OF_SERVICE_URI || '/legal/terms-of-service';

export const APP_AUTH_CALLBACK_URL = APP_URL + APP_AUTH_CALLBACK_URI;
export const APP_AUTH_LOGIN_URL = APP_URL + APP_AUTH_LOGIN_URI;
export const APP_LANDING_PAGE_URL = APP_URL + APP_LANDING_PAGE_URI;

export const APP_SUPPORT_MAILTO = process.env.NEXT_PUBLIC_APP_SUPPORT_MAILTO || 'support@bakabit.com';
export const APP_SESSION_COOKIE_NAME = process.env.NEXT_PUBLIC_APP_SESSION_COOKIE_NAME || 'BAKA_SESSION';

/**
 * OPENAI Plugin Variables
 */
export const APP_OPENAI_VERIFICATION_TOKEN = process.env.NEXT_PUBLIC_OPENAI_VERIFICATION || '';

export const APP_OPENAI_MANIFEST_NAME_FOR_MODEL = 'BakabitVirtualAssistant';
export const APP_OPENAI_MANIFEST_NAME_FOR_HUMAN = 'Bakabit Assistant';
export const APP_OPENAI_MANIFEST_DESC_FOR_MODEL =
  'Bakabit is a personalized virtual assistant designed to manage todos/tasks, calendars, and emails with expansion capabilities for personalized utilities. It uses a code phrase for secure user authentication. Bakabit integrates with various APIs, focusing on privacy and tailored assistance. It supports managing to-dos, scheduling, and personalized tasks. For optimal interaction, specify tasks clearly and provide the necessary authentication code phrase when requested. Bakabit is designed to adapt and expand based on user needs, making it a versatile tool for personal management.';
export const APP_OPENAI_MANIFEST_DESC_FOR_HUMAN = 'Bakabit is a secure and personalized virtual assistant for managing tasks, calendars, and emails.';

/**
 * Google Plugins
 */
export const APP_GOOGLE_OAUTH_CLIENT_ID = process.env.GOOG_OAUTH_CLIENT_ID || '';
export const APP_GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOG_OAUTH_CLIENT_SECRET || '';
export const APP_GOOGLE_OAUTH_CALLBACK_URI = process.env.NEXT_PUBLIC_GOOG_OAUTH_CALLBACK_URI || '/auth/google/callback';
export const APP_GOOGLE_OAUTH_CALLBACK_URL = APP_URL + APP_GOOGLE_OAUTH_CALLBACK_URI;
export const APP_GOOGLE_OAUTH_REDIRECT_URL = APP_URL + '/settings/integrations';

/**
 * The version of the app as defined in package.json
 */
export const APP_PACKAGE_VERSION = process.env.npm_package_version || '0.0.1';
