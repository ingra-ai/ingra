import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUuid( value: string ) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
}

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
