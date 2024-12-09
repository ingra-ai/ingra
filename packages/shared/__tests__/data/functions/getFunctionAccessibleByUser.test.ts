// __tests__/data/functions/getFunctionAccessibleByUser.test.ts

import { describe, it, expect, vi, beforeEach, MockedFunction} from 'vitest';
import db from '@repo/db/client'; // This imports the mocked Prisma client
import { Prisma } from '@repo/db/prisma';
// import { isUuid } from '@repo/shared/lib/utils'; // Actual implementation, not mocked
import { getFunctionAccessibleByUser } from '@repo/shared/data/functions/getFunctionAccessibleByUser';

// Import types for better TypeScript support
/*
type FunctionAccessType = 'owner' | 'subscriber' | 'subscribedCollection' | 'marketplace';
type GetFunctionAccessibleByUserOptionsType<T> = {
  accessTypes: FunctionAccessType[];
  findFirstArgs?: T;
};
type GetFunctionAccessibleByUserDefaultArgsType = Pick<Prisma.FunctionFindFirstArgs, 'include' | 'select'> & {
  where?: Prisma.FunctionFindFirstArgs['where'];
};
*/

type FunctionPayloadType = Prisma.FunctionGetPayload<{ 
  include: { 
    subscribers: true,
    collectors: {
      include: {
        subscribers: true,
      }
    },
    tags: true, 
    arguments: true, 
    owner: {
      select: {
        id: true;
        profile: {
          select: {
            userName: true;
          };
        };
      };
    }
  }
}>;

describe('getFunctionAccessibleByUser', () => {
  // Access the mocked methods from the Prisma client
  const mockFindFirst = db.function.findFirst as unknown as MockedFunction<typeof db.function.findFirst>;

  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Sample test data
  const ownerUserId = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID
  const ownerUserName = 'user123'; // Not a UUID
  const recordId = '123e4567-e89b-12d3-a456-426614174001'; // Valid UUID
  const recordSlug = 'record456'; // Not a UUID

  /**
   * Helper function to create mock function records
   */
  const createMockFunctionRecord = (overrides: Partial<FunctionPayloadType> = {}) => ({
    id: recordId,
    ownerUserId: ownerUserId,
    isPublished: true,
    isPrivate: false,
    arguments: [],
    tags: [],
    subscribers: [],
    collectors: [],
    owner: {
      profile: {
        userName: 'user123',
      },
    },
    ...overrides,
  } as Prisma.FunctionGetPayload<any>);

  it('should return function record when user is the owner and record exists (UUIDs)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord();
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: ['owner'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            id: recordId,
            ownerUserId: ownerUserId,
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when user is the owner and record exists (names)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      owner: {
        id: ownerUserId,
        profile: {
          userName: ownerUserName,
        },
      },
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserName, recordSlug, {
      accessTypes: ['owner'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            slug: recordSlug,
            owner: {
              profile: {
                userName: ownerUserName,
              },
            },
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when user is a subscriber and record exists (UUID)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      subscribers: [{
        userId: ownerUserId,
        id: '',
        createdAt: new Date(),
        functionId: ''
      }],
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: ['subscriber'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            AND: [
              {
                subscribers: {
                  some: {
                    userId: ownerUserId,
                  },
                },
              },
              { id: recordId },
              { isPublished: true, isPrivate: false },
            ],
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when user is a subscriber and record exists (name)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      subscribers: [{
        userId: ownerUserId,
        id: '',
        createdAt: new Date(),
        functionId: ''
      }],
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserName, recordSlug, {
      accessTypes: ['subscriber'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            AND: [
              {
                subscribers: {
                  some: {
                    user: {
                      profile: {
                        userName: ownerUserName,
                      },
                    },
                  },
                },
              },
              { slug: recordSlug },
              { isPublished: true, isPrivate: false },
            ],
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when function is part of a subscribed collection (UUID)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      collectors: [
        {
          name: 'Sample Collection',
          id: 'collection-id',
          slug: 'sample-collection',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: 'A sample collection description',
          userId: ownerUserId,
          subscribers: [{
            userId: ownerUserId,
            id: 'subscriber-id',
            createdAt: new Date(),
            collectionId: 'collection-id'
          }],
        },
      ],
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: ['subscribedCollection'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            AND: [
              {
                collectors: {
                  some: {
                    subscribers: {
                      some: {
                        userId: ownerUserId,
                      },
                    },
                  },
                },
              },
              { id: recordId },
              { isPublished: true, isPrivate: false },
            ],
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when function is part of a subscribed collection (name)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      collectors: [
        {
          name: 'Sample Collection',
          id: 'collection-id',
          slug: 'sample-collection',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: 'A sample collection description',
          userId: ownerUserId,
          subscribers: [
            {
              id: 'subscriber-id',
              createdAt: new Date(),
              userId: ownerUserId,
              collectionId: 'collection-id',
            },
          ],
        },
      ],
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserName, recordSlug, {
      accessTypes: ['subscribedCollection'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            AND: [
              {
                collectors: {
                  some: {
                    subscribers: {
                      some: {
                        user: {
                          profile: {
                            userName: ownerUserName,
                          },
                        },
                      },
                    },
                  },
                },
              },
              { slug: recordSlug },
              { isPublished: true, isPrivate: false },
            ],
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when function is in marketplace (UUID)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      ownerUserId: ownerUserId,
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: ['marketplace'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            AND: [
              { isPublished: true, isPrivate: false },
              { id: recordId },
              { ownerUserId: ownerUserId },
            ],
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when function is in marketplace (name)', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      owner: {
        profile: {
          userName: ownerUserName,
        },
        id: ''
      },
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserName, recordSlug, {
      accessTypes: ['marketplace'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            AND: [
              { isPublished: true, isPrivate: false },
              { slug: recordSlug },
              {
                owner: {
                  profile: {
                    userName: ownerUserName,
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return function record when multiple accessTypes are provided and a match is found', async () => {
    // Arrange
    const mockFunctionRecord = createMockFunctionRecord({
      subscribers: [{
        userId: ownerUserId,
        id: '',
        createdAt: new Date(),
        functionId: ''
      }],
      ownerUserId: ownerUserId,
    });
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: ['subscriber', 'owner'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            id: recordId,
            ownerUserId: ownerUserId,
          },
          {
            AND: [
              {
                subscribers: {
                  some: {
                    userId: ownerUserId,
                  },
                },
              },
              { id: recordId },
              { isPublished: true, isPrivate: false },
            ],
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return null when accessTypes array is empty', async () => {
    // Arrange
    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: [],
    });

    // Assert
    expect(result).toBeNull();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it('should return null when ownerUserIdOrName is missing', async () => {
    // Arrange
    // Act
    const result = await getFunctionAccessibleByUser('', recordId, {
      accessTypes: ['owner'],
    });

    // Assert
    expect(result).toBeNull();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it('should return null when recordIdOrSlug is missing', async () => {
    // Arrange
    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, '', {
      accessTypes: ['owner'],
    });

    // Assert
    expect(result).toBeNull();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it('should append additional where conditions from findFirstArgs', async () => {
    // Arrange
    const additionalWhere: Prisma.FunctionWhereInput = { code: 'someValue' };
    const mockFunctionRecord = createMockFunctionRecord();
    mockFindFirst.mockResolvedValueOnce(mockFunctionRecord);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: ['owner'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
        where: additionalWhere,
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            id: recordId,
            ownerUserId: ownerUserId,
          },
          {
            code: 'someValue',
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toEqual(mockFunctionRecord);
  });

  it('should return null when db.function.findFirst returns null', async () => {
    // Arrange
    mockFindFirst.mockResolvedValueOnce(null);

    // Act
    const result = await getFunctionAccessibleByUser(ownerUserId, recordId, {
      accessTypes: ['owner'],
      findFirstArgs: {
        include: {
          arguments: true,
          tags: true,
        },
      },
    });

    // Assert
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            id: recordId,
            ownerUserId: ownerUserId,
          },
        ],
      },
      include: {
        arguments: true,
        tags: true,
      },
    });
    expect(result).toBeNull();
  });
});
