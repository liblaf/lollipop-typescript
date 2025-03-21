default: lint

build:
  tsup

compile-all: (compile "hello") (compile "cspell-init")

compile bin:
  mkdir --parents --verbose bin/
  bun build --compile --outfile="bin/{{ bin }}" --minify "src/bin/{{ bin }}.ts"

lint:
  biome check --write
