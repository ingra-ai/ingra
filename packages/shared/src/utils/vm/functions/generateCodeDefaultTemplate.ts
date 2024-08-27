import { CODE_DEFAULT_TEMPLATE } from "../../../schemas/function";

export function generateCodeDefaultTemplate(allUserAndEnvKeys: string[]) {
  if (!allUserAndEnvKeys.length) return CODE_DEFAULT_TEMPLATE;

  return CODE_DEFAULT_TEMPLATE.replace(
    "console.log({ ctx });",
    `
       const { ${allUserAndEnvKeys.join(", ")}, ...requestArgs } = ctx;
    `.trim(),
  );
}
