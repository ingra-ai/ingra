import { z } from "zod";
import db from "@lib/db";
import { FunctionSchema } from "@/schemas/function";


export const upsertFunction = async (values: z.infer<typeof FunctionSchema>, userId: string) => {
  const {
    id: recordId,
    slug,
    code,
    isPrivate,
    isPublished,
    httpVerb,
    description,
    arguments: functionArguments,
    tags: functionTags,
  } = values;
  const isEditMode = !!recordId;
  const result = await db.$transaction(async (prisma) => {
    /**
     * If recordId presents, it's an edit mode.
     */
    if (isEditMode) {
      // Check if the function exists
      const existingFunction = await prisma.function.findUnique({
        where: {
          id: values.id,
          ownerUserId: userId,
        },
      });

      if ( !existingFunction ) {
        throw new Error('Function not found');
      }

      // Delete existing arguments and tags
      await Promise.all([
        prisma.functionArgument.deleteMany({
          where: { functionId: existingFunction.id },
        }),
        prisma.functionTag.deleteMany({
          where: { functionId: existingFunction.id },
        }),
      ]);

      // Update the function
      await prisma.function.update({
        where: {
          id: existingFunction.id,
          ownerUserId: userId,
        },
        data: {
          slug,
          code,
          isPrivate,
          isPublished,
          httpVerb,
          description,
          updatedAt: new Date()
        },
      });

      // Insert new arguments and tags
      const insertArgAndTagPromises = [];

      // Insert new arguments
      if (functionArguments) {
        insertArgAndTagPromises.push(
          prisma.functionArgument.createMany({
            data: functionArguments.map(arg => ({
              ...arg,
              functionId: existingFunction.id
            })),
          })
        );
      }

      // Insert new tags
      if (functionTags) {
        insertArgAndTagPromises.push(
          prisma.functionTag.createMany({
            data: functionTags.map(tag => ({
              ...tag,
              functionId: existingFunction.id
            })),
          })
        );
      }

      await Promise.all(insertArgAndTagPromises);
      return existingFunction;
    }
    /**
     * Otherwise, create a new record.
     */
    else {
      // Create new function and arguments
      const newFunction = await prisma.function.create({
        data: {
          slug,
          code,
          isPrivate,
          isPublished,
          httpVerb,
          description,
          arguments: {
            create: (functionArguments || []).map(arg => ({
              name: arg.name,
              type: arg.type,
              isRequired: arg.isRequired,
              defaultValue: arg.defaultValue,
              description: arg.description,
            })),
          },
          tags: {
            create: (functionTags || []).map(tag => ({
              name: tag.name,
            })),
          },
          ownerUserId: userId
        },
      });

      return newFunction;
    }
  });

  return result;

};

export const deleteFunction = async (functionId: string, userId: string) => {
  const relationshipRemovePromises = [
    // Delete function arguments
    db.functionArgument.deleteMany({
      where: {
        functionId,
      },
    }),

    // Delete function tags
    db.functionTag.deleteMany({
      where: {
        functionId,
      },
    }),

    // Delete associated function forks where this function is the original function
    db.functionFork.deleteMany({
      where: {
        OR: [{
          originalFunctionId: functionId,
        }, {
          forkedFunctionId: functionId,
        }]
      },
    }),
  ];

  await Promise.all(relationshipRemovePromises);
  const result = await db.function.delete({
    where: {
      id: functionId,
      ownerUserId: userId
    },
  });

  return result;
};

export const forkFunction = async (functionId: string, userId: string) => {
  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      isPublished: true,
      isPrivate: false,
    },
    include: {
      arguments: true,
      tags: true,
    },
  });

  if (!functionRecord) {
    throw new Error('Function not found');
  }

  // Check if the new slug is already taken by the current user
  const existingFunction = await db.function.findFirst({
    where: {
      ownerUserId: userId,
      slug: functionRecord.slug,
    },
  });

  if ( existingFunction ) {
    throw new Error('Function with the same slug already exists');
  }

  const forkedFunction = await db.function.create({
    data: {
      slug: functionRecord.slug,
      code: functionRecord.code,
      isPrivate: true,
      isPublished: functionRecord.isPublished,
      httpVerb: functionRecord.httpVerb,
      description: functionRecord.description,
      ownerUserId: userId,
      arguments: {
        create: functionRecord.arguments.map(arg => ({
          name: arg.name,
          type: arg.type,
          isRequired: arg.isRequired,
          defaultValue: arg.defaultValue,
          description: arg.description,
        })),
      },
      tags: {
        create: functionRecord.tags.map(tag => ({
          name: tag.name,
        })),
      },
    },
  });

  // Create a record in FunctionFork
  await db.functionFork.create({
    data: {
      originalFunctionId: functionRecord.id,
      forkedFunctionId: forkedFunction.id,
      createdAt: new Date(),
    },
  });

  return forkedFunction;
};

export const subscribeToggleFunction = async (functionId: string, userId: string) => {
  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      isPublished: true,
    },
  });

  if (!functionRecord) {
    throw new Error('Function not found');
  }

  // Check if function with the same slug exists on user's functions
  const existingFunction = await db.function.findFirst({
    where: {
      ownerUserId: userId,
      slug: functionRecord.slug,
    },
  });

  if ( existingFunction ) {
    throw new Error('Function with the same slug already exists');
  }

  // Check if the user is already subscribed to the function
  const existingSubscription = await db.functionSubscription.findFirst({
    where: {
      functionId,
      userId,
    },
    include: {
      function: {
        select: {
          slug: true,
        },
      }
    }
  });

  // Toggle subscription
  if ( existingSubscription ) {
    await db.functionSubscription.delete({
      where: {
        id: existingSubscription.id,
      },
    });

    return {
      functionSlug: existingSubscription.function.slug,
      isSubscribed: false,
    };
  }
  else {
    const subscription = await db.functionSubscription.create({
      data: {
        functionId,
        userId,
      },
      include: {
        function: {
          select: {
            slug: true,
          },
        }
      }
    });

    return {
      functionSlug: subscription.function.slug,
      isSubscribed: true,
    };
  }
}

export const cloneFunction = async (functionId: string, userId: string) => {
  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      OR: [
        {
          ownerUserId: userId,
        },
        {
          subscribers: {
            some: {
              userId,
            }
          }
        }
      ]
    },
    include: {
      arguments: true,
      tags: true,
    },
  });

  if (!functionRecord) {
    throw new Error('Function not found');
  }

  // Create a new slug for the cloned function
  const newSlug = `cloned-${functionRecord.slug}`;

  // Clone the function
  const clonedFunction = await db.function.create({
    data: {
      slug: newSlug,
      code: functionRecord.code,
      isPrivate: functionRecord.isPrivate,
      isPublished: functionRecord.isPublished,
      ownerUserId: userId,
      httpVerb: functionRecord.httpVerb,
      description: functionRecord.description,
      arguments: {
        create: functionRecord.arguments.map(arg => ({
          name: arg.name,
          type: arg.type,
          defaultValue: arg.defaultValue,
          description: arg.description,
          isRequired: arg.isRequired,
        })),
      },
      tags: {
        create: functionRecord.tags.map(tag => ({
          name: tag.name,
        })),
      },
    },
  });

  return clonedFunction;
}