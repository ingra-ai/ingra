import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";

import { logger } from "../utils/logger";

const spinner = ora({
  text: "Loading...",
  color: "yellow",
});

export const example = new Command()
  .name("example")
  .description("An example command")
  .arguments("[name]")
  .action(async (name) => {
    await runExample(name);
  });

export async function runExample(name = "world") {
  logger.info(`Executing ${chalk.bold("example")} command`);
  spinner.start();
  await new Promise((res) => setTimeout(res, 2000));
  spinner.succeed(`Hello, ${name}`);

  return `Hello, ${name}`;
}
