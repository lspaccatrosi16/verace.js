import { z } from "zod";
declare const config: z.ZodObject<{
    lang: z.ZodUnion<[z.ZodLiteral<"ts">, z.ZodLiteral<"go">]>;
    name: z.ZodString;
    version: z.ZodString;
    targets: z.ZodArray<z.ZodUnion<[z.ZodLiteral<"win64">, z.ZodLiteral<"linux64">]>, "many">;
    gomod: z.ZodDefault<z.ZodString>;
    skipPkg: z.ZodDefault<z.ZodBoolean>;
    hooks: z.ZodDefault<z.ZodObject<{
        preBuild: z.ZodDefault<z.ZodString>;
        postBuild: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        preBuild?: string;
        postBuild?: string;
    }, {
        preBuild?: string;
        postBuild?: string;
    }>>;
    produceTypes: z.ZodDefault<z.ZodBoolean>;
    data: z.ZodUnknown;
    test: z.ZodDefault<z.ZodString>;
    cleanAfterBuild: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    name?: string;
    version?: string;
    data?: unknown;
    lang?: "ts" | "go";
    targets?: ("win64" | "linux64")[];
    gomod?: string;
    skipPkg?: boolean;
    hooks?: {
        preBuild?: string;
        postBuild?: string;
    };
    produceTypes?: boolean;
    test?: string;
    cleanAfterBuild?: boolean;
}, {
    name?: string;
    version?: string;
    data?: unknown;
    lang?: "ts" | "go";
    targets?: ("win64" | "linux64")[];
    gomod?: string;
    skipPkg?: boolean;
    hooks?: {
        preBuild?: string;
        postBuild?: string;
    };
    produceTypes?: boolean;
    test?: string;
    cleanAfterBuild?: boolean;
}>;
export type BaseConfig = z.infer<typeof config>;
export declare const validate: (data: unknown) => Promise<BaseConfig>;
export {};
