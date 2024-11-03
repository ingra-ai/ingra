/**
 * Generates a UUID (Universally Unique Identifier) using a template string.
 * The UUID is in the format of 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.
 * 
 * The function replaces each 'x' and 'y' in the template string with a random hexadecimal digit.
 * 
 * @returns {string} A randomly generated UUID.
 */
export function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
