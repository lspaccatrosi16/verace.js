# Verace.js

<img src="./images/verace.svg">

An assorted collection of tools

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![CI](https://github.com/lspaccatrosi16/verace.js/actions/workflows/test.yml/badge.svg)](https://github.com/lspaccatrosi16/verace.js/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/verace.js.svg)](https://badge.fury.io/js/verace.js)

## Compontents

### Build Tool `/bt`

-   Compatable with typescript and go
-   Produces a self-container executable from typescript
-   Asset embedding
-   Typescript API

#### Running

```bash
$ npx verace -p verace.js
```

See the [specific docs](BUILD_TOOL.md) for more.

### Threading Pools `/tp`

-   Easy multithreading from a worker

#### Running

```bash
$ npx tp -p verace.js
```

See the [specific docs](THREADING_POOLS.md) for more.

## API Reference

See the [full api reference](../markdown/index.md) for detailed information
