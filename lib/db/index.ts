import { PrismaClient } from '@prisma/client';
import { redisExtension } from '@lib/db/extensions/redis';

declare global {
  var prisma: PrismaClient | undefined;
}

const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

export default db.$extends(redisExtension);
