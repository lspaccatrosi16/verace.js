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

import { z, ZodError } from "zod";

const hookDetails = z
	.object({
		file: z.string().default(""),
		command: z.string().default(""),
	})
	.strict();

const defaultHookDetails = {
	command: "",
	file: "",
};

const hookField = z.union([
	z.string().default(""),
	hookDetails.default(defaultHookDetails),
]);

const hooks = z
	.object({
		preBuild: hookField.default(""),
		postBuild: hookField.default(""),
		prePkg: hookField.default(""),
	})
	.strict();

const defaultHook = {
	preBuild: "",
	postBuild: "",
	prePkg: "",
};

const typeScriptConfig = z
	.object({
		buildDir: z.string().default("tsc-build"),
		cleanAfterBuild: z.boolean().default(false),
		produceTypes: z.boolean().default(false),
		skipPkg: z.boolean().default(false),
		test: z.string().default(""),
		assets: z.string().default("assets"),
	})
	.strict();

const defaultTypescript = {
	buildDir: "tsc-build",
	cleanAfterBuild: false,
	produceTypes: false,
	skipPkg: false,
	test: "",
};

const goConfig = z
	.object({
		gomod: z.string().default(""),
	})
	.strict();

const defaultGo = {
	gomod: "",
};

const config = z
	.object({
		lang: z.union([z.literal("ts"), z.literal("go")]),
		name: z.string(),
		version: z.string(),
		targets: z.array(z.union([z.literal("win64"), z.literal("linux64")])),
		hooks: hooks.default(defaultHook),
		data: z.unknown(),
		outDir: z.string().default("bin"),
		entrypoint: z.string().default(""),
		ts: typeScriptConfig.default(defaultTypescript),
		go: goConfig.default(defaultGo),
	})
	.strict();

export type BaseConfig = z.infer<typeof config>;

export type HookField = z.infer<typeof hookField>;

export const validate = (data: unknown): Promise<BaseConfig> => {
	return new Promise((resolve, reject) => {
		try {
			const parsed = config.parse(data);
			resolve(parsed);
			return;
		} catch (e: any) {
			const err = e as ZodError;
			const error = `Error found whilst parsing verace.json :\n${err.toString()}`;

			reject(error);
			return;
		}
	});
};
