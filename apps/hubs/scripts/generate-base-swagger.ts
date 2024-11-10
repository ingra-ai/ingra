#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import {
  APP_NAME,
  APP_PACKAGE_VERSION,
  APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
  // HUBS_APP_URL,
} from '@repo/shared/lib/constants';
import { Logger } from '@repo/shared/lib/logger';
import { config } from 'dotenv';
import swaggerJSDoc from 'swagger-jsdoc';

// Promisify fs methods for async/await usage
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const accessAsync = promisify(fs.access);

// Load environment variables from .env file, if present
config();

// Function to resolve paths relative to the project root
const resolvePathFromRoot = (...segments: string[]) => {
  return path.resolve(__dirname, '..', '..', '..', ...segments);
};

// Define Swagger options
const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: `${APP_NAME} Plugin API`,
      version: APP_PACKAGE_VERSION,
      description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
    },
    // servers: [
    //   {
    //     url: HUBS_APP_URL
    //   },
    // ],
  },
  apis: [
    resolvePathFromRoot('apps', '**', 'app', '**', '*.ts'),
    resolvePathFromRoot('packages', '**', 'src', '**', '*.ts'),
  ],
} satisfies swaggerJSDoc.Options;

// Define the output directory and file
const outputDir = resolvePathFromRoot('apps', 'hubs', 'public', 'static');
const outputFile = path.join(outputDir, 'base-swagger.json');

// Main async function to generate Swagger JSON
const generateBaseSwagger = async () => {
  try {
    Logger.withTag('api|generateBaseSwagger').info(`Generating base swagger from following ${ options.apis.length } paths:\n`, options.apis);

    // Ensure the output directory exists
    try {
      await accessAsync(outputDir, fs.constants.F_OK);
      Logger.withTag('api|generateBaseSwagger').info(`Output directory: ${outputDir}`);
    } catch {
      Logger.withTag('api|generateBaseSwagger').info(`Output directory does not exist. Creating: ${outputDir}`);
      await mkdirAsync(outputDir, { recursive: true });
      Logger.withTag('api|generateBaseSwagger').info(`Successfully created directory: ${outputDir}`);
    }

    Logger.withTag('api|generateBaseSwagger').info('Generating Swagger specification...');
    const swaggerSpec = swaggerJSDoc(options);
    Logger.withTag('api|generateBaseSwagger').info('Swagger specification generated.');

    Logger.withTag('api|generateBaseSwagger').info(`Writing Swagger JSON to ${outputFile}...`);
    await writeFileAsync(outputFile, JSON.stringify(swaggerSpec, null, 2), 'utf8');
    Logger.withTag('api|generateBaseSwagger').info(`Swagger JSON generated successfully at ${outputFile}`);
  } catch (error) {
    console.error('Error during Swagger JSON generation:', error);
    process.exit(1);
  }
};

// Execute the main function
generateBaseSwagger();
