import { Prisma } from "@prisma/client";
import { z } from "zod";

type FunctionArgumentPayload = Prisma.FunctionArgumentGetPayload<{
  select: {
    id: false,
    name: true,
    type: true,
    description: true,
    isRequired: true,
    defaultValue: true,
  }
}>;

export function functionArgsToZod(functionArguments: FunctionArgumentPayload[]) {
  return z.object(
    functionArguments.reduce((acc, arg) => {
      let zodArg: z.ZodTypeAny;

      /**
       * The supported arg.type is from FUNCTION_ARGUMENT_ALLOWED_TYPES at schemas/functions.ts
       */
      switch (arg.type) {
        case 'number':
          zodArg = z.number();
          break;
        case 'boolean':
          zodArg = z.boolean();
          break;
        case 'string':
        default:
          zodArg = z.string();
          break;
      }

      if (arg.description) {
        zodArg = zodArg.describe(arg.description);
      }

      if (arg.isRequired) {
        zodArg = zodArg.optional();
      }

      if (arg.defaultValue !== undefined) {
        zodArg = zodArg.default(arg.defaultValue);
      }

      acc[arg.name] = zodArg;
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );
}