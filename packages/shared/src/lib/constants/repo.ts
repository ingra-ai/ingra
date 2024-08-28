/**
 * Web UI Internal Paths for Repository
 * User and Community repository path are the same. It works in the background by utilizing Next.js parallel routes
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/parallel-routes}
 */

const USER_REPO_URI = "/repo/:userName";
const USER_REPO_COLLECTIONS_URI = USER_REPO_URI + "/collections";
const USER_REPO_COLLECTIONS_VIEW_URI =
  USER_REPO_COLLECTIONS_URI + "/view/:recordId";

const USER_REPO_FUNCTIONS_URI = USER_REPO_URI + "/functions";
const USER_REPO_FUNCTIONS_NEW_URI = USER_REPO_FUNCTIONS_URI + "/new";
const USER_REPO_FUNCTIONS_VIEW_URI =
  USER_REPO_FUNCTIONS_URI + "/view/:recordId";
const USER_REPO_FUNCTIONS_EDIT_URI =
  USER_REPO_FUNCTIONS_URI + "/edit/:recordId";

/**
 * e.g. "/repo/bakabit"
 */
export function getUserRepoUri(ownerUsername: string): string {
  return USER_REPO_URI.replace(":userName", ownerUsername);
}

/**
 * e.g. "/repo/bakabit/collections"
 */
export function getUserRepoCollectionsUri(ownerUsername: string): string {
  return USER_REPO_COLLECTIONS_URI.replace(":userName", ownerUsername);
}

/**
 * e.g. "/repo/bakabit/collections/view/123"
 */
export function getUserRepoCollectionsViewUri(
  ownerUsername: string,
  recordId: string,
): string {
  return USER_REPO_COLLECTIONS_VIEW_URI.replace(
    ":userName",
    ownerUsername,
  ).replace(":recordId", recordId);
}

/**
 * e.g. "/repo/bakabit/functions"
 */
export function getUserRepoFunctionsUri(ownerUsername: string): string {
  return USER_REPO_FUNCTIONS_URI.replace(":userName", ownerUsername);
}

/**
 * e.g. "/repo/bakabit/functions/new"
 */
export function getUserRepoFunctionsNewUri(ownerUsername: string): string {
  return USER_REPO_FUNCTIONS_NEW_URI.replace(":userName", ownerUsername);
}

/**
 * e.g. "/repo/bakabit/functions/view/123"
 */
export function getUserRepoFunctionsViewUri(
  ownerUsername: string,
  recordId: string,
): string {
  return USER_REPO_FUNCTIONS_VIEW_URI.replace(
    ":userName",
    ownerUsername,
  ).replace(":recordId", recordId);
}

/**
 * e.g. "/repo/bakabit/functions/edit/123"
 */
export function getUserRepoFunctionsEditUri(
  ownerUsername: string,
  recordId: string,
): string {
  return USER_REPO_FUNCTIONS_EDIT_URI.replace(
    ":userName",
    ownerUsername,
  ).replace(":recordId", recordId);
}
