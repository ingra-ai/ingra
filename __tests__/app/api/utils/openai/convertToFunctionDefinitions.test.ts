import { mockOpenApi } from '@/__tests__/__mocks__/mockOpenApi';
import { mockOpenAIFunctionDefinitions } from '@/__tests__/__mocks__/mockOpenAIFunctionDefinitions';
import { convertToFunctionDefinitions } from '@app/api/utils/openai/convertToFunctionDefinitions';

describe('tests parse OpenAI function tool definitions parsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should parse Swagger OpenAPI Spec into OpenAI Function Tools Definitions', () => {
    const result = convertToFunctionDefinitions(mockOpenApi);
    expect(result).toStrictEqual(mockOpenAIFunctionDefinitions);
  });
  
});