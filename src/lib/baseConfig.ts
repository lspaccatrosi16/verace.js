import type { BaseConfig } from "./types";

//CORE
export const baseconfig: BaseConfig = {
  lang: "ts",
  name: "my-project",
  version: "0.0.1",
  targets: ["win64", "linux64"],
};

//Typescript basic starter

export const tsFile = `export interface FingoEnv {
  name: string;
  version: string;
}

export default function (env: FingoEnv) {
  console.log(\`Hello world from \${env.name} v\${env.version}\`);
}
`;

export const tsGI = `
dist
bin
node_modules
`;

//Go basic starter

export const goFile = `package main

import "fmt"

func main() {
    fmt.Println("Hello world!")
}`;

export const goGI = "dist";
