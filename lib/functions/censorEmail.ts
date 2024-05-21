export function censorEmail(email: string) {
  // Split the email into the user part and the domain part
  const parts = email.split('@');

  if (parts.length !== 2) {
    // Not a valid email format
    return [email, ''];
  }

  const userPart = parts[0];
  const domainPart = parts[1];

  // Determine the number of characters to show uncensored
  const showChars = userPart.length > 4 ? 2 : 1;

  // Censor part of the user part with asterisks
  const censoredUserPart = userPart.substring(0, showChars) + '*'.repeat(userPart.length - showChars);

  return [censoredUserPart, `${censoredUserPart}@${domainPart}`];
}
