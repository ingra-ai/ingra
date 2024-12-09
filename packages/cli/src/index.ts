import { example } from "@repo/shared/commands/example";
import { Command } from "commander";
import { version } from "../package.json";

function main() {
  const program = new Command()
    .name("cli")
    .description("A simple CLI template")
    .version(version || "0.1.0");

  program.addCommand(example);

  program.parse();
}

main();
