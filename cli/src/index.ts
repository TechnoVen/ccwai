#!/usr/bin/env node
import { CCWAIEngine } from "@ccwai/core/dist/engine.js";

const engine = new CCWAIEngine();
const [cmd, ...rest] = process.argv.slice(2);

switch (cmd) {
  case "list":
    console.log(engine.listCommands().join("\n"));
    process.exit(0);

  case "doctor":
    console.log(engine.doctor());
    process.exit(0);

  case "init":
    console.log("✅ CCWAI already initialized in this directory.");
    process.exit(0);

  default:
    const input = rest.join(" ");
    engine.runCommand(cmd, input)
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
}
