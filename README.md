# Verace.js

> The multi-platform multi-language build tool.

> **Warning**<br />
> This project is very immature. Breaking changes are inevitable.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![CI](https://github.com/lspaccatrosi16/verace.js/actions/workflows/test.yml/badge.svg)](https://github.com/lspaccatrosi16/verace.js/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/verace.js.svg)](https://badge.fury.io/js/verace.js)
* Out of the box support for typescript and go
* Easy extensibility
* Modular build process with json configuration

## TL; DR

1. Create a project

```bash
$ npx verace.js create-exe
```

<p align="center">
<img src="./images/create-exe.png" width="500">
</p>

2. Run it

```bash
$ npx verace.js run-exe
```

<p align="center">
<img src="./images/run-exe.png" width="500">
</p>

3. Develop your app
4. Build it

```bash
$ npx verace.js build-exe
```

<p align="center">
<img src="./images/build-exe.png" width="500">
</p>

## Contents

* [Install](#install)
  + [Standalone installation](#standalone-installation)
  + [Installing using npm](#installing-using-npm)
  + [Running using `npx`](#running-using-npx)
* [Global Options](#global-options)
* [Why](#why)
* [Examples](#examples)
* [Versioning](#versioning)
* [Configuring](#configuring)
  + [Universal Options](#universal-options)
  + [Typescript specific options](#typescript-specific-options)
  + [Go specific options](#go-specific-options)
* [Implementation Details](#implementation-details)
  + [Data embedding in Typescipt](#data-embedding-in-typescipt)
  + [Data embedding in Go](#data-embedding-in-go)
* [Build Pipelines](#build-pipelines)
  + [The Typescript Build Pipeline](#the-typescript-build-pipeline)
  + [The Go Build Pipeline](#the-go-build-pipeline)
* [Javascript API](#javascript-api)
* [Planned features](#planned-features)
* [Licence](#licence)

## Install

### Standalone installation

Add a compiled stand-alone binary from releases to your local path `$PATH`

```bash
#zshrc

...
export VERACE="/path/to/verace"
export PATH="$PATH:VERACE_DIR"
...
```

### Installing using npm

```bash
$ npm i verace.js -g
```

### Running using `npx`

It is also possible to use `npx` to avoid a permanent install:

```bash
$ npx verace.js
```

> **Note** <br />
> All commands assume a permanent system binary is installed. If `npx` is used instead. Replace all mentions of `verace` with `npx verace.js`

## Global Options

#### `-p, --path <path>`

Set this to the path to theverace.json file for operations on projects that are not in the current directory. If unset, the current directory will be used instead. When running `create-exe` , `path` can either be set to a folder, or a verace.json file. If the folder does not exist, it will be automatically created.

## Why

When working on different projects, differences in build procedure can sometimes arise due. **Verace.js** aims to centralise build procedures. By implementing standardisation, bugs are more easily found and dealt with. This project was originally written for two specific projects, but then it was expanded outwards in scope an generalised.

## Examples

Two examples corresponding to the output of running `$ verace create-exe` :

* [Go](/examples/go-example/)
* [Typescript](/examples/ts-example/)

## Versioning

**Verace.js** uses [ `semver` ](https://github.com/npm/node-semver) versioning to manage individual project versions. The version is stored in the [ `version` ](#version) field of [ `verace.json` ](#configuring), and passed to each program in its [environment data](#implementation-details). It can be managed with:

```bash
$ verace version
```

## Configuring

All configuration for **Verace.js** lives in the `verace.json` file created in each project. Properties prepended with an asterisk are required.

```jsonc
//verace.json
{
    "lang": "ts",
    "name": "verace",
    "version": "0.0.2",
    "targets": ["win64", "linux64"],
    "data": { 
        "foo": "bar"
    }, 
    "hooks": {
        "preBuild": "echo hello there",
        "postBuild": "echo general kenobi"
    },
    "entrypoint": "src/index.ts",
    "outDir": "bin",
    "ts": {
      "skipPkg": true,
      "cleanAfterBuild": true,
      "produceTypes": true,
      "buildDir": "tsc-build",
      "test": "npx c8 ava",
    },
    "go": {
      "gomod": "lspaccatrosi16/verace.js",
    }
}
```

> **Note** <br />
> **Verace.js** will not allow building or running if there are errors in `verace.json` . You should make sure that any custom keys lie in the [ `data` ](#implementation-details) attribute (see below).

---

### Universal Options

<table>
<tr>
<td>Field</td>
<td>Description</td>
<td>Default</td>
</tr>
<tr>
<td>

`*lang`

</td>
<td>The language of the project.</td>
<td>

`ts` / `go`

</td>
</tr>
<tr>
<td>

`*name`

</td>
<td>The package name.</td>
<td>x</td>
</tr>
<tr>
<td>

`*version`

</td>
<td>

The semver package version. See [versioning](#versioning) for more details.

</td>
<td>x</td>
</tr>
<tr>
<td>

`*targets`

</td>
<td>The build targets for which package will be built for.</td>
<td>

`win64` / `linux64`

</td>
</tr>
<tr>
<td>

`data`

</td>
<td>

Data passed in any format. See [environment data](#implementation-details) for more details.

</td>
<td>x</td>
</tr>
<tr>
<td>

`hooks`

</td>
<td>Sometimes, it is convenient to have code automatically run directly before, or directly after the build process. This can be achieved with using build hooks: Like `npm` scripts, build hooks can be any command, or set of commands.</td>
<td>

```json
{ 
  "prebuild": ""
  , "postbuild: ""
}
```

</td>
</tr>
<tr>
<td>

`entrypoint`

</td>
<td>The path to the entrypoint of the program.</td>
<td>

`src/index.ts` / `main.go`

</td>
</tr>
<tr>
<td>

`outDir`

</td>
<td>The path to which compiled binaries are outputted to.</td>
<td></td>
</tr>
</table>

> Hook extensibilty with javascript/typescript is planned for the future. Currently, to implement something like that, create the javascript file and then set one of the hooks to include `node myJsScript.js`

---

### Typescript specific options

<table>
<tr>
<td>Field</td>
<td>Description</td>
<td>Default</td>
</tr>
<tr>
<td>

`skipPkg`


</td>
<td>

As produing a self contained executable from javascript is not possible due to the choice to use a [JIT](https://hacks.mozilla.org/2017/02/a-crash-course-in-just-in-time-jit-compilers/), a complete nodejs binary has to be included in every binary produced (using [ `vercel/pkg` ](https://github.com/vercel/pkg)). This adds `30-40MB` to each build, which is undesirable in some cases. If the binary is to be run on systems with nodejs already installed, the compilation step can be skipped. If disabled, a bundled javascript file can be distributed instead, which is found in the `dist` folder: e.g. `dist/verace.cjs` .

</td>
<td

`false`

</td>
</tr>
<tr>
<td>

`cleanAfterBuild`

</td>
<td>

If enabled, all temporary files created in the build are removed. If `skipPkg` is `false` then it will also remove the `dist` folder.

</td>
<td>

`false`

</td>
</tr>
<tr>
<td>

`produceTypes`

</td>
<td>

Allows `d.ts` files to be produced. `cleanAfterBuild` must be disabled to make any use of them.

</td>
<td>

`false`

</td>
</tr>
<tr>
<td>

`buildDir`

</td>
<td>The directory to which the unbundled javascript output is written</td>
<td>

`tsc-build`

</td>
</tr>
<tr>
<td>

`test`

</td>
<td>

Similar to build hooks in purpose. Instead of being run before/after the build process, the command is run after the initial `tsc` stage before the files are bundled (see the [Typescript build pipeline](#the-typescript-build-pipeline) for more details)

</td>
<td>

`""`

</td>
</tr>
</table>



---

### Go specific options

<table>
<tr>
<td>Field</td>
<td>Description</td>
<td>Default</td>
</tr>
<tr>
<td>

`*gomod`

</td>
<td>The go module path</td>
<td>x</td>
</tr>
</table>



## Implementation Details

**Verace.js** is designed in a way that lets custom data be embedded at compile-time. The most obvious example of this is the [ `version` ](#version), and [ `name` ](#name) fields which are present in every program. 

### Data embedding in Typescipt

The `index.ts` file (the entrypoint) of any program should always default export a function. **Verace.js** will then pass environment data to the program as its only argument in object format: 

```ts
//index.ts

//The does not need to be exported, and can be moved to another place, its sole purpose is to provide
//typing for the env parameter
export interface VeraceEnv {
    name: string;
    version: string;
}

export default function(env: VeraceEnv) {
  console.log(`Hello world from ${env.name} v${env.version}`);

}
```

Custom data will be parsed in the [ `data` ](#data) field:

```ts
//index.ts

export interface VeraceEnv {
    name: string;
    version: string;
    data: MyData;
}

interface MyData {
    foo: string;
}
```

Data will always be given in JS Object format

### Data embedding in Go

Data embedding in Go is more conventional: the core `embed` library is used which provided `//go:embed` directives. This gives the additonal flexibility which allows the data embedding to be in a separate file, as all it requires is the `//go:embed` directive to point to [ `verace.json` ](#configuring). The data then needs to be unmarshaled:

```go
//main.go
package main

import (
    _ "embed"
    "encoding/json"
    "fmt"
)

//go:embed verace.json
var veraceJSON []byte
//The data is embedded as a byte array

type PACKAGE struct {
	Name    string `json:"name"`
	Version string `json:"version"`
    Data CUSTOMDATA `json:"data"`
}
//A struct is defined for each level of data

type CUSTOMDATA struct {
  Foo string `json:"foo"`
}

func main() {
    var verace PACKAGE
    json.Unmarshal(veraceJSON, &verace)

    fmt.Printf("Hello world from %s v%s\n", verace.Name, verace.Version)
    fmt.Println(verace.Data.Foo)
}
```

Combining this with [build hooks](#hooks) allows powerful metadata about builds (e.g build time, build environment config) to be created, and used.

## Build Pipelines

This section outlines the build pipelines for each language in detail.

### The Typescript Build Pipeline

> **Warning** <br />
> All output directories are currently hard coded, attempting to change any locations in `tsconfig.json` will not work, and may break things.

1. The file is initially compiled to plain js by `tsc`. Type declaration files are optionally generated in this step depending on whether [`produceTypes`](#typescript-specific-options) is enabled. The output directly is [`buildDir`](#typescript-specific-options).

```bash
$ npx tsc
```

2. The code is compiled to commonjs format with `esbuild` and bundled to `build/veraceTemp.cjs` (the file and directories are both removed at the end of the build). Compiling to `node16` is currently selected due to compatability with `pkg`. Choice will be availible in the future.

```bash
$ npx esbuild ${buildDir}/index.js --outfile="build/veraceTemp.cjs" --bundle --platform=node --target=node16
```

3. A new file,  `index.cjs` is created in `build`, which injects the [environment config](#data-embedding-in-typescipt) into the program.

```js
//build/index.cjs

const exec = require("./veraceTemp.cjs");
const config = require("../verace.json");

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

6. If [`skipPkg`](#typescript-specific-options) is `false` then the package is compiled for the [`targets`](#universal-options). Binaries are outputted to [`${outDir}`](#universal-options)

```bash
$ npx pkg "dist/${config.name}.cjs" -o ${outDir}/${config.name} -t node16-linux -C GZIP
```

### The Go Build Pipeline

1. For each target, `GOOS` is set accordingly, followed by `go build`. Binaries are outputted to [`outDir`](#universal-options)

```bash
$ GOOS=windows go build -o ${outDir}/{config.name} ${env.entrypoint}
```

## Javascript API

A basic API is additionally exposed when imported.

```ts
import api from "verace.js"

await api({
  path: "./examples/go-example/verace.json",
  command: "build-exe",
}).then((res) => {
  console.log(res);
});
```

#### `command`

The action to run. Can be any command runable from the normal CLI.

#### `path`

The (relative) path to the [ `verace.json` ](#configuring) file of the project.

## Planned features

* [x] Add more build configuration (entry points etc)
* [ ] Add support for directly executing javascript build hooks
* [ ] Add further build targets
* [ ] Add plain javascript support
* [ ] Dramatically increase testing coverage
* [ ] Allow target node version to be configured

## Licence

This project is released under the AGPL v3 licence. See [ `LICENCE` ](/LICENCE) for details.
