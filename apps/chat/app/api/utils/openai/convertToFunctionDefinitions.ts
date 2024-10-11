// import type { FunctionTool } from "openai/resources/beta/assistants.mjs";
import type { FunctionDefinition } from 'openai/resources/shared.mjs';
import get from 'lodash/get';

export function convertToFunctionDefinitions(swaggerSpec: Record<string, any>): FunctionDefinition[] {
  if (!swaggerSpec || typeof swaggerSpec !== 'object') {
    throw new Error('Missing OpenAPI JSON schema');
  }

  const functionDefinitions: FunctionDefinition[] = [];

  for (const [path, methods] of Object.entries<Record<string, any>>(swaggerSpec.paths)) {
    for (const [method, details] of Object.entries<Record<string, any>>(methods)) {
      const func = {
        name: details.operationId,
        description: details.summary,
        parameters: {
          type: 'object',
          properties: {} as Record<string, any>,
          required: [] as string[],
        },
      } satisfies FunctionDefinition;

      if (['GET', 'DELETE'].indexOf(method.toUpperCase()) > -1) {
        // Handle parameters in the query string
        if (details.parameters && Array.isArray(details.parameters)) {
          details.parameters.forEach((param) => {
            if (param.in === 'query') {
              func.parameters.properties[param.name] = {
                type: param.schema.type,
                description: param.description,
              };

              if (param.required) {
                func.parameters.required.push(param.name);
              }

              // Handle array types
              if (param.schema.type === 'array' && param.schema.items) {
                func.parameters.properties[param.name].items = param.schema.items;
              }
            }
          });
        }
      } else if (['POST', 'PUT', 'PATCH'].indexOf(method.toUpperCase()) > -1) {
        // Handle request body parameters
        if (details.requestBody) {
          const requestBodySchema = details.requestBody.content['application/json'].schema;
          for (const [propName, propDetails] of Object.entries<Record<string, any>>(requestBodySchema.properties)) {
            func.parameters.properties[propName] = propDetails;
          }
        }
      }

      // Final check for func.parameters.properties if it contains $ref;
      resolvePropertiesRef(func.parameters.properties, swaggerSpec);

      functionDefinitions.push(func);
    }
  }

  return functionDefinitions;
}

const resolvePropertiesRef = (properties: Record<string, any>, swaggerSpec: Record<string, any>) => {
  if (typeof properties === 'object' && properties !== null) {
    for (const key in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        if (key === '$ref') {
          Object.assign(properties, replaceRef(properties[key], swaggerSpec));

          delete properties[key];
        } else {
          resolvePropertiesRef(properties[key], swaggerSpec);
        }
      }
    }
  }

  return properties;
};

const replaceRef = (refValue: string, swaggerSpec: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  const refValueDotSplit = refValue
    .split(/[^a-zA-Z0-9]/g)
    .filter(Boolean)
    .join('.');

  const refComponentsSchema = get(swaggerSpec, refValueDotSplit);

  if (refComponentsSchema && refComponentsSchema.properties) {
    Object.assign(result, {
      type: 'object',
      properties: refComponentsSchema.properties,
    });
  } else {
    console.error(`Could not find schema for $ref: ${refValue}`);
  }
  return result;
};
