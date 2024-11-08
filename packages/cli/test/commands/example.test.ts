import { expect, test } from "vitest";

import { runExample } from "../../src/commands/example";

test("example", async () => {
  expect(await runExample("test")).toBe("Hello, test");
});
