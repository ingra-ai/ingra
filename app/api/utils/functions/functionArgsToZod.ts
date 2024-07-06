import { Prisma } from "@prisma/client";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { ZodObject } from "zod";

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
  const zodSchema = jsonSchemaToZod({
    type: 'object',
    properties: functionArguments.reduce((acc, arg) => {
      acc[arg.name] = {
        type: arg.type,
        description: arg.description,
        default: arg.defaultValue
      };
      return acc;
    }, {} as Record<string, any>),
    required: functionArguments.filter(arg => arg.isRequired).map(arg => arg.name)
  }, { module: "cjs" });

  return eval(zodSchema) as ZodObject<Record<string, any>>;
}