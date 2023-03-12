# Advanced Usage

## Data Embedding

**Verace.js** is designed in a way that lets custom data be embedded at compile-time. The most obvious example of this is the `version`, and `name`fields which are present in every program in the [`verace.json`](/docs/CONFIGURING.md).

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

Data embedding in Go is more conventional: the core `embed` library is used which provided `//go:embed` directives. This gives the additonal flexibility which allows the data embedding to be in a separate file, as all it requires is the `//go:embed` directive to point to [ `verace.json` ](/docs/CONFIGURING.md). The data then needs to be unmarshaled:

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

Combining this with [build hooks](/docs/CONFIGURING.md) allows powerful metadata about builds (e.g build time, build environment config) to be created, and used.

## Javascript API

A basic API is additionally exposed when imported.

```ts
import api from "verace.js";

await api({
	path: "./examples/go-example/verace.json",
	command: "build-exe",
	verbose: false,
}).then(res => {
	console.log(res);
});
```

##### `command`

The action to run. Can be any command runable from the normal CLI.

##### `path`

The (relative) path to the [ `verace.json` ](/docs/CONFIGURING.md) file of the project.

##### `verbose`

Set verbose logging.
