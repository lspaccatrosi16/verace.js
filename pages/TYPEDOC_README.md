# Verace.js

<img src="/media/verace.svg">

An assorted collection of tools

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![CI](https://github.com/lspaccatrosi16/verace.js/actions/workflows/test.yml/badge.svg)](https://github.com/lspaccatrosi16/verace.js/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/verace.js.svg)](https://badge.fury.io/js/verace.js)

## Compontents

### Build Tool `/bt`

-   Compatable with typescript and go
-   Produces a self-contained executable from typescript
-   Asset embedding
-   Typescript API
-   Dynamic build hooks (e.g. build time)

#### Running

```bash
$ npx verace -p verace.js
```

See the {@page ../bt/pages/BUILD_TOOL.md [ build tool docs ]} for more.

### Threading Pools `/tp`

-   Easy multithreading from a worker

#### Running

```bash
$ npx tp -p verace.js
```

See the {@page ../tp/pages/THREADING_POOLS.md threading pools docs} for more.

## Hacking

### Prerequisites

The following local dependencies are needed in `$PATH`

-   [NodeJS](https://nodejs.org/) >= 16
-   [Go](https://go.dev/) >= 1.18
-   [VHS](https://github.com/charmbracelet/vhs) >= 0.3

### Installing package dependencies

1. Install npm dependencies for all subprojects:

```bash
$ npm run dep
```

### Building

All projects are built with `verace`. Each one's configuration allows a unified build command:

```bash
$ verace build-exe
```

## Contributing

### PR Checklist

> Note you must have the latest `verace` build accessible in your `$PATH`. E.g. by running
>
> ```bash
> $ cp bt/bin/verace ~/.local/bin
> ```

1. Code styling

```bash
$ npm run lint
```

2. Testing

```bash
$ npm run test
```

3. VHS Gifs

```bash
$ npm run vhs
```

4. API Reference

```bash
$ npm run doc
```

Or run

```bash
$ npm run predep
```

for all of them at once.
