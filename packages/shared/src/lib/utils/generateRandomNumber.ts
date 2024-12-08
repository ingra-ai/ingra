/**
 * Generates a random number with the specified length.
 * e.g. If length is 6 - Generate a random number between 000000 and 999999
 *
 * @param {number} length - The length of the random number. Defaults to 6.
 * @returns {string} The generated random number as a string.
 */
export const generateRandomNumber = (length = 6): string => {
  // Generate a random number between 0 and the largest number with the specified length
  const maxNumber = 10 ** length;
  const randomNumber = Math.floor(Math.random() * maxNumber);
  
  // Convert to a string and pad with leading zeros to ensure it has the specified length
  const paddedRandomNumber = randomNumber.toString().padStart(length, '0');
  return paddedRandomNumber;
};