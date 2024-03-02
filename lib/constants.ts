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

/**
 * OPENAI Plugin Variables
 */
export const APP_OPENAI_VERIFICATION_TOKEN = process.env.NEXT_PUBLIC_OPENAI_VERIFICATION || '';

export const APP_OPENAI_MANIFEST_NAME_FOR_MODEL = "BakabitVirtualAssistant";
export const APP_OPENAI_MANIFEST_NAME_FOR_HUMAN = "Bakabit Assistant";
export const APP_OPENAI_MANIFEST_DESC_FOR_MODEL = "Bakabit is a personalized virtual assistant designed to manage tasks, calendars, and emails with expansion capabilities for personalized utilities. It uses a code phrase for secure user authentication. Bakabit integrates with various APIs, focusing on privacy and tailored assistance. It supports managing to-dos, scheduling, and personalized tasks. For optimal interaction, specify tasks clearly and provide the necessary authentication code phrase when requested. Bakabit is designed to adapt and expand based on user needs, making it a versatile tool for personal management.";
export const APP_OPENAI_MANIFEST_DESC_FOR_HUMAN = "Bakabit is a secure and personalized virtual assistant for managing tasks, calendars, and emails.";


/**
 * The version of the app as defined in package.json
 */
export const APP_PACKAGE_VERSION = process.env.npm_package_version || '0.0.1';