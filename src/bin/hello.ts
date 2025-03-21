#!/usr/bin/env bun

import { version } from "@package.json";
import { Command } from "commander";

function main(): void {
  const program = new Command("hello")
    .argument("[PERSON]", "Person to say hello to", "world")
    .version(version)
    .action(async (person: string): Promise<void> => {
      console.log(`Hello, ${person}!`);
    });
  program.parse();
}

main();
