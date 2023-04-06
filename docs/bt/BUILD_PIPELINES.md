## Build Pipelines

This section outlines the build pipelines for each language in detail. It shouldn't be relevant to you if you're just using the tool.

### The Typescript Build Pipeline

> **Warning** <br />
> Instead of using esbuild as a dependency, a wrapper around its raw go library, `cjs-translate` is included as a binary, which allows it to be bundled as an asset and thus permits the transpilation of hook files to commonjs for execution.

1. The file is initially compiled to plain js by `tsc`. Type declaration files are optionally generated in this step depending on whether [`produceTypes`](/docs/CONFIGURING.md#typescript-specific-options) is enabled. The output directly is [`buildDir`](/docs/bt/CONFIGURING.md#typescript-specific-options).

```bash
$ npx tsc
```

2. The code is compiled to commonjs format with `esbuild` and bundled to `build/veraceTemp.cjs` (the file and directories are both removed at the end of the build). Compiling to `node16` is currently selected due to compatability with `pkg`. Choice will be availible in the future.

```bash
$ npx esbuild ${buildDir}/index.js --outfile="build/veraceTemp.cjs" --bundle --platform=node --target=node16
```

3. A new file, `index.cjs` is created in `build`, which injects the [environment config](/docs/bt/ADVANCED_USAGE.md#data-embedding-in-typescipt) into the program.

```js
//build/index.cjs

const exec = require("./veraceTemp.cjs");
const config = require("../verace config");

exec.default(config);
```

4. `esbuild` is run again to bundle the two files together. The output is `dist/${config.name}.cjs`

```bash
$ npx esbuild build/index.cjs --outfile="dist/${config.name}.cjs" --bundle --platform=node --target=node16
```

5. A node shebang is inserted at the top of the created file

```js
#!/usr/bin/env node

...
```

6. If [`skipPkg`](/docs/bt/CONFIGURING.md#typescript-specific-options) is `false` then the package is compiled for the [`targets`](/docs/bt/CONFIGURING.md#universal-options). Binaries are outputted to [`${outDir}`](/docs/bt/CONFIGURING.md#universal-options). If specified, the `prePkg` hook is ran before the packaging of each target.

```bash
$ npx pkg "dist/${config.name}.cjs" -o ${outDir}/${config.name} -t node16-linux -C GZIP
```

### The Go Build Pipeline

1. For each target, `GOOS` is set accordingly, followed by `go build`. Binaries are outputted to [`outDir`](/docs/bt/CONFIGURING.md#universal-options)

```bash
$ GOOS=windows go build -o ${outDir}/{config.name} ${env.entrypoint}
```
