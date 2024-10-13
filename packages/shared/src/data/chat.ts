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
export async function saveChat(id: string, messages: any, userId: string) {
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
      return await db.chat.findFirst({
        where: {
          id,
          userId,
        },
      });
    } else {
      // Chat does not exist; create a new one for the user
      return await db.chat.create({
        data: {
          id,
          messages,
          userId,
        },
      });
    }
  } catch (error) {
    Logger.error('Failed to save chat in database');
    throw error;
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
    throw error;
  }
}

/**
 * Retrieves all chats for a specific user, ordered by creation date descending.
 *
 * @param userId - The ID of the user whose chats to retrieve.
 */
export async function getChatsByUserId(userId: string) {
  try {
    return await db.chat.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    Logger.error('Failed to get chats by user from database');
    throw error;
  }
}

/**
 * Retrieves a single chat by its ID, but only if it belongs to the specified user.
 *
 * @param id - The unique identifier of the chat.
 * @param userId - The ID of the user owning the chat.
 */
export async function getChatById(id: string, userId: string) {
  try {
    return await db.chat.findFirst({
      where: {
        id,
        userId,
      },
    });
  } catch (error) {
    Logger.error('Failed to get chat by id from database');
    throw error;
  }
}
