import { Prisma } from "@prisma/client";

export type EnvVarsPayload = Prisma.EnvVarsGetPayload<{}>;
export type EnvVarsOptionalPayload =  Omit<EnvVarsPayload, 'createdAt' | 'updatedAt'> & {
  createdAt?: EnvVarsPayload['createdAt'];
  updatedAt?: EnvVarsPayload['updatedAt'];
};