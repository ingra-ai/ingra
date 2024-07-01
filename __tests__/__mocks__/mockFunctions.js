export const mockFunctionHelloWorld = {
  "id": "66f80fac-9937-4d4c-8b90-bc5fcda08f12",
  "code": `
async function handler(ctx) {
  // View all your environment variables, user variables and arguments by logging them to the console
  const { GOOGLE_OAUTH_ACCESS_TOKEN, GOOGLE_OAUTH_EMAIL_ADDRESS, ...requestArgs } = ctx;

  if (!GOOGLE_OAUTH_ACCESS_TOKEN || !GOOGLE_OAUTH_EMAIL_ADDRESS) {
    throw new Error('A default Google OAuth is not found. Please check your account settings and integrate your account with Google.');
  }

  return 'Hello World';
}
  `.trim(),
  "arguments": [
    {
      "id": "51234567-89ab-cdef-0123-456789abcdef",
      "functionId": "66f80fac-9937-4d4c-8b90-bc5fcda08f12",
      "name": "arg1",
      "type": "string",
      "defaultValue": "",
      "description": "The mock argument as a string",
      "isRequired": true
    },
    {
      "id": "51234567-89ab-cdef-0123-456789abcdef",
      "functionId": "66f80fac-9937-4d4c-8b90-bc5fcda08f12",
      "name": "arg2",
      "type": "number",
      "defaultValue": "5",
      "description": "The mock argument as a number",
      "isRequired": false
    }
  ]
}