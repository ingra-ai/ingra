/**
 * Web UI Internal Paths for Repository
 * User and Community repository path are the same. It works in the background by utilizing Next.js parallel routes
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/parallel-routes}
 */

const USER_REPO_URI = '/repo/:userName';
const USER_REPO_COLLECTIONS_URI = USER_REPO_URI + '/collections';
const USER_REPO_COLLECTIONS_VIEW_URI = USER_REPO_COLLECTIONS_URI + '/:recordIdOrSlug/view';

const USER_REPO_FUNCTIONS_URI = USER_REPO_URI + '/functions';
const USER_REPO_FUNCTIONS_NEW_URI = USER_REPO_FUNCTIONS_URI + '/new';
const USER_REPO_FUNCTIONS_VIEW_URI = USER_REPO_FUNCTIONS_URI + '/:recordIdOrSlug/view';
const USER_REPO_FUNCTIONS_EDIT_URI = USER_REPO_FUNCTIONS_URI + '/:recordIdOrSlug/edit';

const USER_API_COLLECTIONS_OPENAPI_JSON_URI = '/api/v1/:userName/collections/:recordIdOrSlug/openapi.json';
const USER_API_COLLECTIONS_SWAGGER_URI = '/api/v1/:userName/collections/:recordIdOrSlug/swagger';

/**
 * e.g. "/repo/bakabit"
 */
export function getUserRepoUri(ownerUsername: string): string {
  return USER_REPO_URI.replace(':userName', ownerUsername);
}

/**
 * e.g. "/repo/bakabit/collections"
 */
export function getUserRepoCollectionsUri(ownerUsername: string): string {
  return USER_REPO_COLLECTIONS_URI.replace(':userName', ownerUsername);
}

/**
 * e.g. "/repo/bakabit/collections/123/view"
 */
export function getUserRepoCollectionsViewUri(ownerUsername: string, recordIdOrSlug: string): string {
  return USER_REPO_COLLECTIONS_VIEW_URI.replace(':userName', ownerUsername).replace(':recordIdOrSlug', recordIdOrSlug);
}

/**
 * e.g. "/api/v1/bakabit/collections/123/openapi.json"
 */
export function getUserApiCollectionsOpenApiJsonUri(ownerUsername: string, recordIdOrSlug: string): string {
  return USER_API_COLLECTIONS_OPENAPI_JSON_URI.replace(':userName', ownerUsername).replace(':recordIdOrSlug', recordIdOrSlug);
}

/**
 * e.g. "/api/v1/bakabit/collections/123/swagger"
 */
export function getUserApiCollectionsSwaggerUri(ownerUsername: string, recordIdOrSlug: string): string {
  return USER_API_COLLECTIONS_SWAGGER_URI.replace(':userName', ownerUsername).replace(':recordIdOrSlug', recordIdOrSlug);
}

/**
 * e.g. "/repo/bakabit/functions"
 */
export function getUserRepoFunctionsUri(ownerUsername: string): string {
  return USER_REPO_FUNCTIONS_URI.replace(':userName', ownerUsername);
}

/**
 * e.g. "/repo/bakabit/functions/new"
 */
export function getUserRepoFunctionsNewUri(ownerUsername: string): string {
  return USER_REPO_FUNCTIONS_NEW_URI.replace(':userName', ownerUsername);
}

/**
 * e.g. "/repo/bakabit/functions/123/view"
 */
export function getUserRepoFunctionsViewUri(ownerUsername: string, recordIdOrSlug: string): string {
  return USER_REPO_FUNCTIONS_VIEW_URI.replace(':userName', ownerUsername).replace(':recordIdOrSlug', recordIdOrSlug);
}

/**
 * e.g. "/repo/bakabit/functions/123/edit"
 */
export function getUserRepoFunctionsEditUri(ownerUsername: string, recordIdOrSlug: string): string {
  return USER_REPO_FUNCTIONS_EDIT_URI.replace(':userName', ownerUsername).replace(':recordIdOrSlug', recordIdOrSlug);
}
