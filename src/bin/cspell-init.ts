#!/usr/bin/env bun

import { version } from "@package.json";
import { Command } from "commander";
import {
  type CSpellReporter,
  type CSpellSettings,
  type Issue,
  defineConfig,
  getDefaultReporter,
  lint,
} from "cspell";
import { $ } from "execa";
import * as path from "pathe";
import * as prettier from "prettier";

function defaultConfig(): CSpellSettings {
  return defineConfig({
    $schema:
      "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
    allowCompoundWords: true,
    enableGlobDot: true,
    ignorePaths: [
      "**/.cspell.*",
      "**/.git/",
      "**/*-lock.*",
      "**/*.lock",
      "**/*.sum",
    ],
    useGitignore: true,
    version: "0.2",
  });
}

function defaultReporter(): Required<CSpellReporter> {
  return getDefaultReporter(
    {
      fileGlobs: ["."],
      color: true,
      issues: true,
      progress: true,
      showSuggestions: true,
      summary: true,
    },
    { unique: true },
  );
}

async function gitRoot(): Promise<string> {
  const { stdout } = await $({
    stderr: "inherit",
  })`git rev-parse --show-toplevel`;
  return stdout;
}

async function findWords(config: CSpellSettings): Promise<Set<string>> {
  const words: Set<string> = new Set();
  const reporter: Required<CSpellReporter> = defaultReporter();
  await lint(
    ["."],
    {
      config: {
        url: new URL("https://github.com/liblaf/lollipop-typescript"),
        settings: {
          ...config,
          noConfigSearch: true,
        },
      },
      root: await gitRoot(),
    },
    {
      ...reporter,
      issue: (issue: Issue): void => {
        reporter.issue(issue);
        words.add(issue.text.toLowerCase());
      },
    },
  );
  return words;
}

async function dumpsConfig(config: CSpellSettings): Promise<string> {
  const text: string = JSON.stringify(config);
  return await prettier.format(text, { parser: "json" });
}

function main(): void {
  const program = new Command("cspell-init")
    .version(version)
    .action(async (): Promise<void> => {
      const root: string = await gitRoot();
      const config: CSpellSettings = defaultConfig();
      const words: Set<string> = await findWords(config);
      await Bun.write(
        path.join(root, ".cspell.json"),
        await dumpsConfig({ ...config, words: Array.from(words).sort() }),
      );
    });
  program.parse();
}

main();
