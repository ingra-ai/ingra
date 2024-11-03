// File: /pages/api/v1/me/bio/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { Logger } from '@repo/shared/lib/logger';
import { mixpanel } from '@repo/shared/lib/analytics';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { storeMemory, retrieveMemory, updateMemory, deleteMemory, type BioMetadata, mapBioMetadata } from '@repo/shared/data/bio';
import { ActionError } from '@v1/types/api-response';

/**
 * @swagger
 * /api/v1/me/bio:
 *   post:
 *     summary: Store a new memory for the user.
 *     operationId: storeMemory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content to store and embed.
 *               metadata:
 *                 type: object
 *                 description: Additional metadata for personalization.
 *                additionalProperties: true
 *                 properties:
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Tags for the memory.
 *                   category:
 *                     type: string
 *                     description: Category of the memory.
 *     responses:
 *       '200':
 *         description: Memory stored successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 *       - Memory
 */
export async function POST(req: NextRequest) {
  const { text, metadata }: { text: string; metadata: BioMetadata } = await req.json();

  return await apiAuthTryCatch<any>(async (authSession) => {
    if (!text) {
      throw new ActionError('error', 400, 'Text is required to store a memory.');
    }

    const userId = authSession.user.id;

    // Store the memory
    const memoryId = await storeMemory(userId, text, {
      ...metadata,
    });

    // Logging and analytics
    const logger = Logger.withTag('api|memory').withTag('operation|storeMemory').withTag(`user|${userId}`);
    logger.info(`Stored a new memory with ID: ${memoryId}`);

    mixpanel.track('Memory Stored', {
      distinct_id: userId,
      ...getAnalyticsObject(req),
      memoryId,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Memory stored successfully.',
        data: { memoryId },
      },
      { status: 200 }
    );
  });
}

/**
 * @swagger
 * /api/v1/me/bio:
 *   get:
 *     summary: Retrieve memories based on a query.
 *     operationId: retrieveMemory
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The query text to search for similar memories.
 *       - in: query
 *         name: topK
 *         schema:
 *           type: integer
 *           default: 5
 *         required: false
 *         description: Number of top results to retrieve.
 *     responses:
 *       '200':
 *         description: Memories retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 *       - Memory
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('query');
  const topK = parseInt(searchParams.get('topK') || '5', 10);

  return await apiAuthTryCatch<any>(async (authSession) => {
    if (!text) {
      throw new ActionError('error', 400, 'Query text is required to retrieve memories.');
    }

    const userId = authSession.user.id;

    // Retrieve memories
    const results = await retrieveMemory(userId, text, topK);

    // Logging and analytics
    const logger = Logger.withTag('api|memory').withTag('operation|retrieveMemory').withTag(`user|${userId}`);
    logger.info(`Retrieved ${results.matches?.length || 0} memories.`);

    mixpanel.track('Memory Retrieved', {
      distinct_id: userId,
      ...getAnalyticsObject(req),
      query: text,
      resultsCount: results.matches?.length || 0,
      readUnits: results?.usage?.readUnits || 0,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Memories retrieved successfully.',
        data: results.matches.map((match) => {
          return {
            id: match.id,
            score: match.score,
            text: match.metadata?.text || '',
            metadata: {
              ...mapBioMetadata(match.metadata),
              text: undefined,
            },
          }
        }),
      },
      { status: 200 }
    );
  });
}

/**
 * @swagger
 * /api/v1/me/bio:
 *   put:
 *     summary: Update an existing memory.
 *     operationId: updateMemory
 *     parameters:
 *       - in: query
 *         name: memoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the memory to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The updated text content for the memory.
 *               metadata:
 *                 type: object
 *                 description: Updated metadata for personalization.
 *                 additionalProperties: true
 *                 properties:
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Tags for the memory.
 *                   category:
 *                     type: string
 *                     description: Category of the memory.
 *     responses:
 *       '200':
 *         description: Memory updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 *       - Memory
 */
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memoryId = searchParams.get('memoryId');

  const { text, metadata }: { text: string; metadata: BioMetadata } = await req.json();

  return await apiAuthTryCatch<any>(async (authSession) => {
    if (!memoryId) {
      throw new ActionError('error', 400, 'Memory ID is required to update a memory.');
    }
    if (!text) {
      throw new ActionError('error', 400, 'Text is required to update a memory.');
    }

    const userId = authSession.user.id;

    // Update the memory
    await updateMemory(userId, memoryId, text, metadata);

    // Logging and analytics
    const logger = Logger.withTag('api|memory').withTag('operation|updateMemory').withTag(`user|${userId}`);
    logger.info(`Updated memory with ID: ${memoryId}`);

    mixpanel.track('Memory Updated', {
      distinct_id: userId,
      ...getAnalyticsObject(req),
      memoryId,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Memory updated successfully.',
        data: { memoryId },
      },
      { status: 200 }
    );
  });
}

/**
 * @swagger
 * /api/v1/me/bio:
 *   delete:
 *     summary: Delete a memory by ID.
 *     operationId: deleteMemory
 *     parameters:
 *       - in: query
 *         name: memoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the memory to delete.
 *     responses:
 *       '200':
 *         description: Memory deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 *       - Memory
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memoryId = searchParams.get('memoryId');

  return await apiAuthTryCatch<any>(async (authSession) => {
    if (!memoryId) {
      throw new ActionError('error', 400, 'Memory ID is required to delete a memory.');
    }

    const userId = authSession.user.id;

    // Delete the memory
    await deleteMemory(userId, [memoryId]);

    // Logging and analytics
    const logger = Logger.withTag('api|memory').withTag('operation|deleteMemory').withTag(`user|${userId}`);
    logger.info(`Deleted memory with ID: ${memoryId}`);

    mixpanel.track('Memory Deleted', {
      distinct_id: userId,
      ...getAnalyticsObject(req),
      memoryId,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Memory deleted successfully.',
        data: { memoryId },
      },
      { status: 200 }
    );
  });
}
