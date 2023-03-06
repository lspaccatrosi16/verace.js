import { z } from "zod";
const hooks = z.object({
    preBuild: z.string().default(""),
    postBuild: z.string().default(""),
});
const defaultHook = {
    preBuild: "",
    postBuild: "",
};
const config = z
    .object({
    lang: z.union([z.literal("ts"), z.literal("go")]),
    name: z.string(),
    version: z.string(),
    targets: z.array(z.union([z.literal("win64"), z.literal("linux64")])),
    gomod: z.string().default(""),
    skipPkg: z.boolean().default(false),
    hooks: hooks.default(defaultHook),
    produceTypes: z.boolean().default(false),
    data: z.unknown(),
    test: z.string().default(""),
    cleanAfterBuild: z.boolean().default(false),
})
    .strict();
export const validate = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const parsed = config.parse(data);
            resolve(parsed);
            return;
        }
        catch (e) {
            const err = e;
            const error = `Error found whilst parsing verace.json :\n${err.toString()}`;
            reject(error);
            return;
        }
    });
};
