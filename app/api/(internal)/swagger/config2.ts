
import { APP_NAME, APP_PACKAGE_VERSION, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN } from '@lib/constants';
import swaggerJsdoc from 'swagger-jsdoc';

import testSwagger from './__SWAGGERJSDOC/lib';



export const getSwaggerSpec2 = ( extraProps?: any ) => {
  const swaggerOptions = {
    apiFolder: 'app/api', // define api folder under app folder
    apis: [
      'schemas/**/*.ts',
      'lib/**/*.ts',
      'app/**/*.ts'
    ],
    definition: {
      openapi: '3.0.0',
      info: {
        title: extraProps?.title || `${APP_NAME} Plugin API`,
        version: APP_PACKAGE_VERSION,
        description: extraProps?.description || APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
      },
      paths: {
        ...( extraProps?.extraPaths || {} ),
      },
      components: {
      },
      security: [],
    },
  };

  // @ts-ignore
  const openapiSpecification = testSwagger(swaggerOptions);
  return openapiSpecification;
};
