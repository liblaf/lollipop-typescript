import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/bin/cspell-init.ts", "./src/bin/hello.ts"],
  minify: true,
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
});
