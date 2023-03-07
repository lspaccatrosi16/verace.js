import type { BaseConfig } from "./veraceConfig"

//CORE
export const baseconfig: BaseConfig = {
	lang: "ts",
	name: "my-project",
	version: "0.0.1",
	targets: ["win64", "linux64"],
	data: {
		foo: "bar",
	},
}

//Typescript basic starter

export const tsFile = `
//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation

export interface FingoEnv {
  name: string;
  version: string;
  data: Record<string, unknown>;
}

export default function (env: FingoEnv) {
  console.log(\`Hello world from \${env.name} v\${env.version}\`);
  console.log("Data:", env.data);
}
`

export const tsGI = `
bin
node_modules
`

//Go basic starter

export const goFile = `package main

//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation

import (
  _ "embed"
	"encoding/json"
  "fmt"
  )

//go:embed verace.json
var veraceJSON []byte

type PACKAGE struct {
	Name    string \`json:"name"\`
	Version string \`json:"version"\`
  Data CUSTOMDATA \`json:"data"\`
}

type CUSTOMDATA struct {
  Foo string \`json:"foo"\`
}

func main() {
    var verace PACKAGE
    json.Unmarshal(veraceJSON, &verace)

    fmt.Printf("Hello world from %s v%s\\n", verace.Name, verace.Version)
    fmt.Println(verace.Data.Foo)
}`

export const goGI = "dist"

export const tsConfig = {
	compilerOptions: {
		outDir: "tsc-build",
		baseUrl: "./src",
		typeRoots: ["src/types", "node_modules/@types"],
		sourceMap: false,
		declaration: true,
		allowSyntheticDefaultImports: true,
		lib: ["ES2021"],
		module: "ES2022",
		moduleResolution: "node",
		target: "ES2021",
		strictFunctionTypes: true,
		noImplicitAny: true,
		importsNotUsedAsValues: "error",
		experimentalDecorators: true,
		emitDecoratorMetadata: true,
		allowJs: true,
		checkJs: true,
		paths: {
			"src/*": ["*"],
		},
	},
	include: ["src"],
}

interface PKGJSON {
	name: string
	devDependencies: Record<string, string>
	author: string
	licence: string
	private: boolean
	typings?: string
}

export const makePackageJson = (bc: BaseConfig) => {
	const baseConfig: PKGJSON = {
		name: bc.name,
		devDependencies: {
			"@types/node": "^16.17",
			"typescript": "^4.9",
			"pkg": "^5.8",
			"esbuild": "^0.16",
		},
		author: "",
		licence: "UNLICENCED",
		private: true,
	}

	if (bc.produceTypes) {
		baseConfig.typings = "typings/index.d.ts"
	}

	return baseConfig
}
