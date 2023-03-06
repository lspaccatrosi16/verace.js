import type { BaseConfig } from "./veraceConfig";
export declare const baseconfig: BaseConfig;
export declare const tsFile = "\n//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation\n\nexport interface FingoEnv {\n  name: string;\n  version: string;\n  data: Record<string, unknown>;\n}\n\nexport default function (env: FingoEnv) {\n  console.log(`Hello world from ${env.name} v${env.version}`);\n  console.log(\"Data:\", env.data);\n}\n";
export declare const tsGI = "\nbin\nnode_modules\n";
export declare const goFile = "package main\n\n//See https://github.com/lspaccatrosi16/verace.js/#readme for detailed documentation\n\nimport (\n  _ \"embed\"\n\t\"encoding/json\"\n  \"fmt\"\n  )\n\n//go:embed verace.json\nvar veraceJSON []byte\n\ntype PACKAGE struct {\n\tName    string `json:\"name\"`\n\tVersion string `json:\"version\"`\n  Data CUSTOMDATA `json:\"data\"`\n}\n\ntype CUSTOMDATA struct {\n  Foo string `json:\"foo\"`\n}\n\nfunc main() {\n    var verace PACKAGE\n    json.Unmarshal(veraceJSON, &verace)\n\n    fmt.Printf(\"Hello world from %s v%s\\n\", verace.Name, verace.Version)\n    fmt.Println(verace.Data.Foo)\n}";
export declare const goGI = "dist";
export declare const tsConfig: {
    compilerOptions: {
        outDir: string;
        baseUrl: string;
        typeRoots: string[];
        sourceMap: boolean;
        declaration: boolean;
        allowSyntheticDefaultImports: boolean;
        lib: string[];
        module: string;
        moduleResolution: string;
        target: string;
        strictFunctionTypes: boolean;
        noImplicitAny: boolean;
        importsNotUsedAsValues: string;
        experimentalDecorators: boolean;
        emitDecoratorMetadata: boolean;
        allowJs: boolean;
        checkJs: boolean;
        declarationDir: string;
    };
    include: string[];
};
interface PKGJSON {
    name: string;
    devDependencies: Record<string, string>;
    author: string;
    licence: string;
    private: boolean;
    typings?: string;
}
export declare const makePackageJson: (bc: BaseConfig) => PKGJSON;
export {};
