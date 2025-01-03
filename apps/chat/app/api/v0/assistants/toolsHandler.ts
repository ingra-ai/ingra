import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { HUBS_APP_URL } from '@repo/shared/lib/constants';
// import { getAuthSwaggerSpec } from '@v1/me/swagger/config';
import { Logger } from '@repo/shared/lib/logger';
import { handleFetch } from '@repo/shared/utils/handleFetch';
import { type DataMessage } from 'ai';
import { OpenAI } from 'openai';

const getApiDetails = async (authSession: AuthSessionResponse, toolName: string) => {
  // const authSwaggerSpec = await getAuthSwaggerSpec(authSession);

  // if (!authSwaggerSpec || typeof authSwaggerSpec?.paths !== 'object' || !toolName) {
  //   return null;
  // }

  // for (const [path, pathSchema] of Object.entries<Record<string, any>>(authSwaggerSpec.paths)) {
  //   for (const [httpVerb, details] of Object.entries<Record<string, any>>(pathSchema)) {
  //     if (details.operationId === toolName) {
  //       return {
  //         url: HUBS_APP_URL + path,
  //         method: httpVerb.toUpperCase(),
  //       };
  //     }
  //   }
  // }

  return null as any;
};

const toolsHandler = async (authSession: AuthSessionResponse, toolName: string, parameters: Record<string, any> = {}, headers: Record<string, any> = {}) => {
  const apiDetails = await getApiDetails(authSession, toolName);

  if (!apiDetails) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  return await handleFetch(apiDetails.url, apiDetails.method, parameters, headers);
};

export const actionToolCalls = async (
  authSession: AuthSessionResponse,
  threadId: string,
  headers: Record<string, any> = {},
  toolCalls: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall[],
  sendDataMessage?: (dataMessage: DataMessage) => void
) => {
  const resultPromises = toolCalls.map(async (toolCall) => {
    const logger = Logger.withTag('actionToolCalls').withTag(`thread|${threadId}`).withTag(`user|${authSession.user?.id}`);
    const toolResult = {
      tool_call_id: toolCall.id,
      output: '',
    };

    try {
      const functionArgs = JSON.parse(toolCall.function?.arguments || '{}');
      const functionName = toolCall.function?.name || '';

      if (!functionName) {
        throw new Error('Function name is required');
      }

      if (!functionArgs) {
        throw new Error('Function arguments are required');
      }

      sendDataMessage?.({
        role: 'data',
        data: `Invoking ${functionName}...`,
      });

      const toolOutput = await toolsHandler(authSession, functionName, functionArgs, headers).catch((error: any) => {
        logger.error(`Error running tool ${functionName}: ${error.message}`);
        return `An error occurred when calling the related function: ${error.message}`;
      });

      toolResult.output = JSON.stringify(toolOutput);
    } catch (err: any) {
      logger.error(`Error handling tool call: ${err?.message || 'Unknown Error'}`);
      toolResult.output = `An error occurred when calling the related function: ${err?.message || 'Unknown Error'}`;
      sendDataMessage?.({
        role: 'data',
        data: `An error occurred when calling the related function: ${err?.message || 'Unknown Error'}`,
      });
    }

    return toolResult;
  });

  return await Promise.all(resultPromises);
};
