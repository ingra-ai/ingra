import { isUuid } from "@repo/shared/lib/utils";

import { generateUUID } from "./utils";

export const getChatUri = (chatId?: string) => {
  if ( chatId && !isUuid(chatId) ) {
    chatId = generateUUID();
  }

  return chatId ? `/chat/${chatId}` : '/chat';
};