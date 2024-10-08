import { FetchFunctionPaginationDataReturnType } from '@repo/shared/data/functions';

type FetchFunctionCardPayloadRaw = FetchFunctionPaginationDataReturnType['records'][0];

// Define the additional properties
type PartialProperties = {
  isSubscribed: boolean;
  owner: {
    id: string;
    profile: {
      userName: string;
    } | null;
  };
  subscribers: {
    id: string;
  }[] | null;
  _count: {
    arguments?: number;
    tags?: number;
    subscribers?: number;
  };
};

// Omit the keys from PartialProperties and combine with Partial<PartialProperties>
export type FunctionCardPayload = Omit<FetchFunctionCardPayloadRaw, keyof PartialProperties> & Partial<PartialProperties>;


