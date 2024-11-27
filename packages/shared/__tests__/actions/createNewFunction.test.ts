import { describe, it, expect, vi, Mock, beforeEach, afterEach } from 'vitest';
import * as actionAuthTryCatch from '@repo/shared/utils/actionAuthTryCatch';
import * as dataFunctions from '@repo/shared/data/functions';
import { FunctionSchema } from '@repo/shared/schemas/function';
import { z } from 'zod';
import { createNewFunction } from '@/src/actions/functions';

vi.mock('@repo/shared/utils/actionAuthTryCatch');
vi.mock('@repo/shared/data/functions');

describe('createNewFunction', () => {
  const mockAuthSession = {
    user: {
      id: 'user-id',
      profile: {
        userName: 'testUser',
      },
      envVars: [
        { id: 'env-id', ownerUserId: 'user-id', key: 'ENV_KEY', value: 'ENV_VALUE' },
      ],
    },
  };

  const validFunctionPayload: z.infer<typeof FunctionSchema> = {
    "slug": "listGoogleDriveFiles",
    "code": "async function handler(ctx) {\n  const { GOOGLE_OAUTH_ACCESS_TOKEN } = ctx;\n  \n  if (!GOOGLE_OAUTH_ACCESS_TOKEN) {\n    throw new Error(\"Google OAuth token is missing.\");\n  }\n\n  const url = \"https://www.googleapis.com/drive/v3/files\";\n  const options = {\n    method: \"GET\",\n    headers: {\n      Authorization: `Bearer ${GOOGLE_OAUTH_ACCESS_TOKEN}`,\n      \"Content-Type\": \"application/json\"\n    }\n  };\n\n  try {\n    const response = await fetch(url, options);\n    if (!response.ok) {\n      throw new Error(`Error fetching Google Drive files: ${response.statusText}`);\n    }\n\n    const data = await response.json();\n    return data.files || [];\n  } catch (error) {\n    console.error(\"Failed to list Google Drive files:\", error);\n    throw error;\n  }\n}",
    "description": "List all files from Google Drive using Google OAuth token.",
    "httpVerb": "GET" as any,
    "isPrivate": false,
    "isPublished": true,
    "createdAt": new Date(),
    "updatedAt": new Date(),
    "arguments": [],
    "tags": []
  };

  beforeEach(() => {
    vi.resetAllMocks();

    (actionAuthTryCatch.actionAuthTryCatch as Mock).mockImplementation(async (fn) => fn(mockAuthSession));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new function successfully', async () => {
    const mockResult = {
      slug: 'test-function',
      id: 'function-id',
    };

    (dataFunctions.upsertFunction as Mock).mockResolvedValue(mockResult);

    const result = await createNewFunction(validFunctionPayload);

    expect(result.status).toBe('ok');
    expect(result.message).toBe(`Function "${mockResult.slug}" has been created.`);
    expect(result.data).toEqual(mockResult);
  });

  it('should validate slug format', async () => {
    const invalidSlugPayload = {
      ...validFunctionPayload,
      slug: 'list_google_drive_files',
    };

    await expect(createNewFunction(invalidSlugPayload)).rejects.toThrow('Invalid slug format. Slugs must consist of alphanumeric characters and hyphens only, and cannot start or end with a hyphen.');
  });

  it('should throw an error if function payload is empty', async () => {
    await expect(createNewFunction({} as z.infer<typeof FunctionSchema>)).rejects.toThrow('Function payload is empty or invalid. Are you passing the patch data as "{ function: { ... } }"?');
  });

  it('should throw an error if function payload contains an ID', async () => {
    const payloadWithId = {
      ...validFunctionPayload,
      id: 'function-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await expect(createNewFunction(payloadWithId as z.infer<typeof FunctionSchema>)).rejects.toThrow("Creating new function doesn't require an ID. Please remove the ID from the payload.");
  });

  it('should throw an error if function slug is missing', async () => {
    const payloadWithoutSlug = { ...validFunctionPayload, slug: '' };
    await expect(createNewFunction(payloadWithoutSlug as z.infer<typeof FunctionSchema>)).rejects.toThrow('Function slug is required to create a new function.');
  });

  it('should throw an error if function description is missing', async () => {
    const payloadWithoutDescription = { ...validFunctionPayload, description: '' };
    await expect(createNewFunction(payloadWithoutDescription as z.infer<typeof FunctionSchema>)).rejects.toThrow('Function description is required to create a new function.');
  });

  it('should throw an error if profile username is not setup', async () => {
    const mockAuthSessionWithoutUsername = {
      ...mockAuthSession,
      user: {
        ...mockAuthSession.user,
        profile: {
          userName: '',
        },
      },
    };

    (actionAuthTryCatch.actionAuthTryCatch as Mock).mockImplementation(async (fn) => fn(mockAuthSessionWithoutUsername));

    await expect(createNewFunction(validFunctionPayload)).rejects.toThrow('Profile username is not setup.');
  });
});