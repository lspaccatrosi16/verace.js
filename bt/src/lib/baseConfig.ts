/*
Copyright (C) 2023  Luca Spaccatrosi

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

import { inspect } from "util";
import type { BaseConfig } from "./veraceConfig";

//CORE
export const baseconfig: BaseConfig = {
	name: "my-project",
	version: "0.0.1",
	targets: ["win64", "linux64"],
	data: {
		foo: "bar",
	},
	ts: {},
	go: {},
};

//Typescript basic starter

export const tsFile = `
//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation

export interface VeraceEnv {
  name: string;
  version: string;
  data: Record<string, unknown>;
}

export default function (env: VeraceEnv) {
  console.log(\`Hello world from \${env.name} v\${env.version}\`);
  console.log("Data:", env.data);
}
`;

export const tsGI = `
bin
node_modules
`;

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
}`;

export const goGI = `dist
bin`;

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
};

interface PKGJSON {
	name: string;
	devDependencies: Record<string, string>;
	author: string;
	licence: string;
	private: boolean;
	typings?: string;
}

export const makePackageJson = (bc: BaseConfig) => {
	const baseConfig: PKGJSON = {
		name: bc.name,
		devDependencies: {
			"@types/node": "^16.17",
			"typescript": "^4.9",
			"pkg": "^5.8",
		},
		author: "",
		licence: "UNLICENCED",
		private: true,
	};

	if (bc.ts.produceTypes) {
		baseConfig.typings = "typings/index.d.ts";
	}

	return baseConfig;
};

export function makeVeraceConfig(userChoice: BaseConfig) {
	return `
import { defineConfig } from "verace.js/helpers";

export default defineConfig(
  ${inspect(userChoice, false, null, false)}
);`;
}
