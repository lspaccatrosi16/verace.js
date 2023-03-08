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

export type BaseConfig = z.infer<typeof config>;

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
