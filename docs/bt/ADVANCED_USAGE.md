# Advanced Usage

## Data Embedding

**Verace.js** is designed in a way that lets custom data be embedded at compile-time. The most obvious example of this is the `version`, and `name`fields which are present in every program in the [`verace config`](/docs/bt/CONFIGURING.md).

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

export default function (env: VeraceEnv) {
	console.log(`Hello world from ${env.name} v${env.version}`);
}
```

Custom data will be parsed in the `data` field:

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

Data embedding in Go is more conventional: the core `embed` library is used which provided `//go:embed` directives. This gives the additonal flexibility which allows the data embedding to be in a separate file, as all it requires is the `//go:embed` directive to point to [ `verace config` ](/docs/bt/CONFIGURING.md). The data then needs to be unmarshaled:

```go
//main.go
package main

import (
    _ "embed"
    "encoding/json"
    "fmt"
)

//go:embed verace config
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

Combining this with [build hooks](/docs/bt/CONFIGURING.md) allows powerful metadata about builds (e.g build time, build environment config) to be created, and used.

## Javascript/Typescript API

A complete API is exposed complete with full typings. It uses rust-style error handling provided by [rustic](https://github.com/franeklubi/rustic)

### A Basic example

```ts
import api from "verace.js/bt";

const verace = new api({
	path: "path/to/verace/config",
});

const envResult = verace.setupEnvironment();
if (envResult.isErr()) {
	throw envResult.unwrapErr();
}

const res = await cfgResult.unwrap().buildExe();

if (res.isErr()) {
	throw res.unwrapErr();
}
```

### Advanced Usage

It is possible to override config for every run:

```ts
import api from "verace.js/bt";

const verace = new api({
	path: "path/to/verace/config",
});

const envResult = verace.setupEnvironment();
if (envResult.isErr()) {
	throw envResult.unwrapErr();
}
verace
	.setConfigOverrides({ entrypoint: "foo" })
	.setTsConfigOverride({
		test: "bar",
	})
	.setGoConfigOverride({ gomod: "baz" });

const res = await verace.buildExe();

if (res.isErr()) {
	throw res.unwrapErr();
}
```

The config will still be checked so if incorrect values are passed (which your intellisense should object to) it will return an error.
