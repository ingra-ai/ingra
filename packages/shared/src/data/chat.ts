import db from '@repo/db/client';
import { Logger } from '../lib';

/**
 * Saves a chat by updating an existing one or creating a new one.
 * Only operates on chats belonging to the specified user.
 *
 * @param id - The unique identifier of the chat.
 * @param messages - The messages to save.
 * @param userId - The ID of the user owning the chat.
 */
export async function saveChat<T extends {}>(id: string, messages: T[], userId: string) {
  try {
    // Attempt to update the chat if it exists and belongs to the user
    const updatedChat = await db.chat.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        messages,
      },
    });

    if (updatedChat.count > 0) {
      // Chat was updated; fetch and return the updated chat
      const record = await db.chat.findFirst({
        where: {
          id,
          userId,
        },
      });

      return {
        ...record,
        messages: ( record?.messages || [] ) as T[],
      };
    } else {
      let newName = 'Untitled';

      // Assuming messages is CoreMessage from @vercel/ai.
      if (Array.isArray(messages) && messages.length > 0) {
        newName = ( ( messages?.[0] as any )?.content || '' ).slice(0, 100).trim() || 'Untitled';
      }

      // Chat does not exist; create a new one for the user
      const record = await db.chat.create({
        data: {
          id,
          name: newName,
          messages,
          userId,
        },
      });

      return {
        ...record,
        messages: ( record?.messages || [] ) as T[],
      };
    }
  } catch (error) {
    Logger.error('Failed to save chat in database');
    return null;
  }
}

/**
 * Deletes a chat by its ID, but only if it belongs to the specified user.
 *
 * @param id - The unique identifier of the chat.
 * @param userId - The ID of the user owning the chat.
 */
export async function deleteChatById(id: string, userId: string) {
  try {
    return await db.chat.deleteMany({
      where: {
        id,
        userId,
      },
    });
  } catch (error) {
    Logger.error('Failed to delete chat by id from database');
    return null;
  }
}

/**
 * Retrieves all chats for a specific user, ordered by creation date descending.
 *
 * @param userId - The ID of the user whose chats to retrieve.
 */
export async function getChatsByUserId(userId: string) {
  try {
    const records = await db.chat.findMany({
      select: {
        id: true,
        name: true,
        messages: false,
        createdAt: true,
        updatedAt: true,
      },
      where: { 
        userId 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records;
  } catch (error) {
    Logger.error('Failed to get chats by user from database');
    return null;
  }
}

/**
 * Retrieves a single chat by its ID, but only if it belongs to the specified user.
 *
 * @param id - The unique identifier of the chat.
 * @param userId - The ID of the user owning the chat.
 */
export async function getChatById<T extends {}>(id: string, userId: string) {
  try {
    const record = await db.chat.findFirst({
      where: {
        id,
        userId,
      },
    });

    if ( !record ) {
      return null;
    }

    return {
      ...record,
      messages: ( record?.messages || [] ) as T[],
    }
  } catch (error) {
    Logger.error('Failed to get chat by id from database');
    return null;
  }
}
