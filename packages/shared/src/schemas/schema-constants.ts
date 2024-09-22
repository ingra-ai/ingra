/**
 * Regular expression pattern for validating slugs.
 * Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/**
 * Reserved function slugs that cannot be used.
 */
export const RESERVED_SLUGS = [
  'new',
  'search',
  'edit',
  'view',
  'createNew',
  'list',
  'delete',
  'update',
  'clone',
  'dryRun',
  'execute',
  'openapi',
  'swagger',
];
