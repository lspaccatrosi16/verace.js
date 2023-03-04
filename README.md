# Fingo.js

> The multi-platform multi-language build tool.

> **Warning**<br />
> This project is very immature. Expect breaking changes.

- Out of the box support for typescript and go
- Easy extensibility
- Modular build process with json configuration

## Install

Add a compiled stand-alone binary to your local path `$PATH`

```bash
#zshrc

...
export FINGO_DIR="/path/to/fingo"
export PATH="$PATH:FINGO_DIR"
...
```

## Basic Usage

Create a project:

```bash
$ fingo create-exe
```

Run it:

```bash
$ fingo run-exe
Run start:
Hello world from my-typescript-project v0.0.1
Data: { foo: 'bar' }

Run ended
```

By running:

```bash
fingo build-exe
```

You can compile a project for the targets specified in your [fingo.json](#configuring)

## Why

When working on different projects, differences in build procedure can sometimes arise due. **Fingo.js** aims to centralise build procedures. By implementing standardisation, bugs are more easily found and dealt with. 
## Configuring

All configuration for **Fingo.js** lives in the `fingo.json` file created in each project.
In every **Fingo.js** project, there will be a basic structure:

```jsonc
//fingo.json
{
  "lang": "ts",  // Either "ts" or "go"
  "name": "fingo", // The name of the project
  "version": "0.0.2", // The semver compatable version
  "targets": ["win64", "linux64"], // Build targets (see below)
  "data": { 
    "foo": "bar"
  } // Custom data passed
}
```
> **Build targets** <br/>
> Currently, building to only `win64` and `linux64` are supported due to the difficulty of testing other possible configurations.

### Build hooks

Sometimes, it is convenient to have code automatically run directly before, or directly after the build process. This can be achieved with using build hooks:

```jsonc
//fingo.json
{
    ...
    "hooks": {
        "preBuild": "echo hello there",
        "postBuild": "echo general kenobi"
    }
    ...
}
```
Like `npm` scripts, build hooks can be any command, or set of commands. 
> Extensibilty with javascript/typescript is planned for the future. Currently, to implement something like that, create the javascript file and then set one of the hooks to include `node preBuild.js`

### Typescript specific options
As produing a self contained executable from javascript is not possible due to the choice to use a [JIT](https://hacks.mozilla.org/2017/02/a-crash-course-in-just-in-time-jit-compilers/), a complete nodejs binary has to be included in every binary produced (using [`vercel/pkg`](https://github.com/vercel/pkg)). This adds `30-40MB` to each build, which is undesirable in some cases. If the binary is to be run on systems with nodejs already installed, the compilation step can be skipped. 

```jsonc
//fingo.json
{
    ...
    "skipPkg": true, //By default it is false
    ...
}
```
If disabled, a bundled javascript file can be distributed instead, which is found in the `dist` folder: e.g. `dist/fingo.cjs`. 

> **Note** <br />
> A bundled file is always produced, so if both a self-contained binary, and a smaller javascript file is needed, ensure that `skipPkg` is `false`

### Go specific options

At this point in time, there are no specific Go compilation options. A `gomod` field is present in the [`fingo.json`](#configuring), but it is not used.


## Environment Data

**Fingo.js** is designed in a way that lets custom data be embedded at compile-time. The most obvious example of this is the `version`, and `name` fields which are present in every program. 

### Typescript
The `index.ts` file (the entrypoint) of any program should always default export a function. **Fingo.js** will then pass environment data to the program as its only argument in object format: 
```ts
//index.ts

//The does not need to be exported, and can be moved to another place, its sole purpose is to provide
//typing for the env parameter
export interface FingoEnv {
    name: string;
    version: string;
}

export default function(env: FingoEnv) {
  console.log(`Hello world from ${env.name} v${env.version}`);

}
```

Custom data will be parsed in the `data` field:
```ts
//index.ts

export interface FingoEnv {
    name: string;
    version: string;
    data: MyData;
}

interface MyData {
    foo: string;
}
```
Data will always be given in JS Object format

### Go

Data embedding in Go is more conventional: the core `embed` library is used which provided `//go:embed` directives. This gives the additonal flexibility which allows the data embedding to be in a separate file, as all it requires is the `//go:embed` directive to point to `fingo.json`. The data then needs to be unmarshaled:

```go
//main.go
package main

import (
    _ "embed"
    "encoding/json"
    "fmt"
)

//go:embed fingo.json
var fingoJSON []byte
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
    var fingo PACKAGE
    json.Unmarshal(fingoJSON, &fingo)

    fmt.Printf("Hello world from %s v%s\\n", fingo.Name, fingo.Version)
    fmt.Println(fingo.Data.Foo)
}
```

Combining this and [build hooks](#build-hooks) allows powerful metadata about builds (e.g build time, build environment config) to be created, and used.

## Versioning

**Fingo.js** uses [`semver`](https://github.com/npm/node-semver) versioning to manage individual project versions. The version is stored in the `version` field of [`fingo.json`](#configuring), and passed to each program in its [environment data](#environment-data). It can be managed with:
```bash
$ fingo version
```

## Examples

Two examples corresponding to the output of running `$ fingo create-exe` :

- [Go](/examples/go-example/)
- [Typescript](/examples/ts-example/)

## Licence

This project is released under the AGPL v3 licence. See [`LICENCE`](/LICENCE) for details.

