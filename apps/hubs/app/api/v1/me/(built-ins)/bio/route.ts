// File: /pages/api/v1/me/bio/route.ts

import { storeMemory, retrieveMemory, updateMemory, deleteMemory, type BioMetadata, mapBioMetadata, type AdditionalFilterType, type FilterOptions } from '@repo/shared/data/bio';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { ActionError } from '@repo/shared/types';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { parseStartAndEnd } from '@repo/shared/utils/chronoUtils';
import { formatDistance } from 'date-fns/formatDistance';
import { NextRequest, NextResponse } from 'next/server';


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
 *     summary: Retrieve memories based on a query and optional filters.
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         required: false
 *         description: |
 *           Start date for filtering memories. Can be a natural language date (e.g., 'last Monday', '2023-10-01').
 *           If only startDate is provided, memories from this date onwards are retrieved.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         required: false
 *         description: |
 *           End date for filtering memories. Can be a natural language date (e.g., 'today', '2023-10-15').
 *           If only endDate is provided, memories up to this date are retrieved.
 *       - in: query
 *         name: dateField
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, both]
 *           default: createdAt
 *         required: false
 *         description: Date field to filter on.
 *       - in: query
 *         name: operator
 *         schema:
 *           type: string
 *           enum: [AND, OR]
 *           default: AND
 *         required: false
 *         description: Logical operator to combine date filters.
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
  const text = searchParams.get('query') || '';
  const topK = parseInt(searchParams.get('topK') || '5', 10);
  const startInput = searchParams.get('startDate');
  const endInput = searchParams.get('endDate');
  const dateField = searchParams.get('dateField') as 'createdAt' | 'updatedAt' | 'both';
  const operator = searchParams.get('operator') as 'AND' | 'OR';

  return await apiAuthTryCatch<any>(async (authSession) => {
    const userId = authSession.user.id,
      userTz = authSession.user.profile?.timeZone || 'America/New_York';

    // Build extraFilters and filterOptions
    const extraFilters: AdditionalFilterType = {};
    const filterOptions: FilterOptions = {
      dateFilterType: dateField || 'createdAt',
      dateFilterOperator: operator || 'AND',
    };

    let adjustedStartInput = startInput;
    let adjustedEndInput = endInput;

    // If only one of startInput or endInput is provided, set the other to a default value
    if (startInput && !endInput) {
      // If only startDate is provided, set endDate to 'now'
      adjustedEndInput = 'now';
    } 
    else if (!startInput && endInput) {
      // If only endDate is provided, set startDate to a date far in the past
      adjustedStartInput = '2024-01-01';
    }

    if (startInput || endInput) {
      try {
        const { startDate, endDate } = parseStartAndEnd(adjustedStartInput!, adjustedEndInput!, userTz);

        if (endDate < startDate) {
          throw new Error('endDate cannot be earlier than startDate.');
        }

        const dateFilter: Record<string, number> = {};
        
        if (startDate) {
          dateFilter.$gte = startDate.getTime();
        }

        if (endDate) {
          dateFilter.$lte = endDate.getTime();
        }

        if (filterOptions.dateFilterType === 'createdAt' || filterOptions.dateFilterType === 'both') {
          extraFilters.createdAt = dateFilter;
        }

        if (filterOptions.dateFilterType === 'updatedAt' || filterOptions.dateFilterType === 'both') {
          extraFilters.updatedAt = dateFilter;
        }
      } catch (error: any) {
        throw new ActionError(
          'error',
          400,
          error?.message || 'Invalid date input. Please check your startDate and endDate inputs.'
        );
      }
    }

    // Retrieve memories
    const results = await retrieveMemory(userId, text, topK, extraFilters, filterOptions);

    // Logging and analytics
    const logger = Logger.withTag('api|memory')
      .withTag('operation|retrieveMemory')
      .withTag(`user|${userId}`);
    logger.info(`Retrieved ${results.matches?.length || 0} memories.`);

    mixpanel.track('Memory Retrieved', {
      distinct_id: userId,
      ...getAnalyticsObject(req),
      query: text,
      extraFilters,
      resultsCount: results.matches?.length || 0,
      readUnits: results?.usage?.readUnits || 0,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: (() => {
          const totalMemories = results.matches.length;
          let msg = `Found ${totalMemories} memor${totalMemories !== 1 ? 'ies' : 'y'}`;
        
          const dateDescriptions = [];
          const now = new Date();
        
          // Helper function to format dates nicely
          const formatDate = (dateString: number) => {
            const date = new Date(dateString);
            return formatDistance(date, now, { addSuffix: true });
          };
        
          if (extraFilters.createdAt) {
            const createdAtFilter = extraFilters.createdAt;
            const parts = [];
        
            if (createdAtFilter.$gte && createdAtFilter.$lte) {
              parts.push(`created between ${formatDate(createdAtFilter.$gte)} and ${formatDate(createdAtFilter.$lte)}`);
            } else if (createdAtFilter.$gte) {
              parts.push(`created from ${formatDate(createdAtFilter.$gte)} until now`);
            } else if (createdAtFilter.$lte) {
              parts.push(`created up to ${formatDate(createdAtFilter.$lte)} ago`);
            }
        
            if (parts.length > 0) {
              dateDescriptions.push(parts.join(' '));
            }
          }
        
          if (extraFilters.updatedAt) {
            const updatedAtFilter = extraFilters.updatedAt;
            const parts = [];
        
            if (updatedAtFilter.$gte && updatedAtFilter.$lte) {
              parts.push(`updated between ${formatDate(updatedAtFilter.$gte)} and ${formatDate(updatedAtFilter.$lte)}`);
            } else if (updatedAtFilter.$gte) {
              parts.push(`updated from ${formatDate(updatedAtFilter.$gte)} until now`);
            } else if (updatedAtFilter.$lte) {
              parts.push(`updated up to ${formatDate(updatedAtFilter.$lte)} ago`);
            }
        
            if (parts.length > 0) {
              dateDescriptions.push(parts.join(' '));
            }
          }
        
          if (dateDescriptions.length > 0) {
            msg += ` that were ${dateDescriptions.join(' and ')}`;
          }
        
          return msg + '.';
        })(),
        data: results.matches.map((match) => {
          return {
            id: match.id,
            score: match.score,
            text: match.metadata?.text || '',
            metadata: {
              ...mapBioMetadata(match.metadata),
              text: undefined,
            },
          };
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
