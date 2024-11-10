import { NextRequest, NextResponse } from 'next/server';

import { convertToFunctionDefinitions } from '@app/api/utils/openai/convertToFunctionDefinitions';

import { getBaseSwaggerSpec } from '../../../../hubs/app/api/(internal)/swagger/getBaseSwaggerSpec';

/**
 * Returns OpenAPI yaml file when in production
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(request: NextRequest) {
  const swaggerSpec = await getBaseSwaggerSpec();
  const funcDefs = convertToFunctionDefinitions(swaggerSpec);

  return NextResponse.json(funcDefs, {
    status: 200,
  });
}
