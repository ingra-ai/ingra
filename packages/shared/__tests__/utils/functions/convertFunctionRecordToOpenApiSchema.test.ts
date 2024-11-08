import { convertFunctionRecordToOpenApiSchema } from '@repo/shared/utils/functions/convertFunctionRecordToOpenApiSchema';

describe('convertFunctionRecordToOpenApiSchema', () => {
  it('should convert a function record to an OpenAPI schema', () => {
    const functionRecord = {
      arguments: [
        {
          name: 'arg1',
          type: 'string',
          description: 'Argument 1',
          isRequired: true,
          defaultValue: '',
        },
        {
          name: 'arg2',
          type: 'number',
          description: 'Argument 2',
          isRequired: false,
          defaultValue: 0,
        },
      ],
      description: 'Function description',
      httpVerb: 'GET',
      slug: 'function-slug',
      tags: [{ name: 'tag1' }, { name: 'tag2' }],
    };

    const opts = {
      transformHitUrl: (functionSlug: string) => `/${functionSlug}`,
    };

    const result = convertFunctionRecordToOpenApiSchema(functionRecord as any, opts);

    expect(result).toEqual({
      '/function-slug': {
        get: {
          summary: 'Function description',
          operationId: 'function-slug',
          description: 'Function description',
          responses: {
            '200': {
              description: 'Successfully retrieved records.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiSuccess',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, such as missing or invalid parameters.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ApiError',
                  },
                },
              },
            },
          },
          tags: ['tag1', 'tag2'],
          parameters: [
            {
              name: 'arg1',
              in: 'query',
              description: 'Argument 1',
              required: true,
              schema: {
                type: 'string',
                default: '',
              },
            },
            {
              name: 'arg2',
              in: 'query',
              description: 'Argument 2',
              required: false,
              schema: {
                type: 'integer',
                default: 0,
              },
            },
          ],
        },
      },
    });
  });
});
