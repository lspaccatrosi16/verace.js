import { z, ZodError } from "zod";
import make_logger from "./log";

const hooks = z.object({
	preBuild: z.optional(z.string()),
	postBuild: z.optional(z.string()),
});

const log = make_logger();

const config = z
	.object({
		lang: z.union([z.literal("ts"), z.literal("go")]),
		name: z.string(),
		version: z.string(),
		targets: z.array(z.union([z.literal("win64"), z.literal("linux64")])),
		gomod: z.optional(z.string()),
		skipPkg: z.optional(z.boolean()),
		hooks: z.optional(hooks),
		data: z.unknown(),
	})
	.strict();

export type BaseConfig = z.infer<typeof config>;

export const validate = (data: unknown): Promise<BaseConfig> => {
	return new Promise((resolve, reject) => {
		try {
			const parsed = config.parse(data);
			resolve(parsed);
			return;
		} catch (e: any) {
			const err = e as ZodError;
			log().danger("Error found whilst parsing verace.json :");

			log().danger(err.toString());

			process.exit(1);

			return;
		}
	});
};
