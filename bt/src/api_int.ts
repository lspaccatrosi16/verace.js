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

import type { BaseConfig, GoConfig, TSConfig } from "./lib/veraceConfig";
import rustic from "rustic";
import z from "zod";

import { buildApi } from "./commands/build-exe";
import { createApi, CreateApi } from "./commands/create-exe";
import { RunApi, runApi } from "./commands/run-exe";
import { versionApi } from "./commands/version";
import executionEnv from "./lib/executionEnvironment";
import zodWrapper from "./lib/zodParserWithResult";

import type { Result } from "rustic";
const { isOk, Ok, Err } = rustic;

const configParser = z
	.object({
		path: z.string(),
		verbose: z.boolean().default(false),
	})
	.strict();

type APICONFIG = z.infer<typeof configParser>;

export default class VeraceApi {
	private config: APICONFIG;
	private test: boolean;

	constructor(config: APICONFIG) {
		const cfg = zodWrapper(configParser, config);
		if (cfg.isErr()) {
			throw cfg.unwrapErr();
		}
		this.config = cfg.unwrap();
	}

	setTestMode(test: boolean) {
		this.test = test;
	}

	setupEnvironment(): rustic.ResultEquipped<VeraceApi, string> {
		const res = this.createEnvironment();
		return rustic.equip(res);
	}

	private createEnvironment(): Result<VeraceApi, string> {
		const env = executionEnv.getInstance();
		const res = env.setupInstance(this.test, true, this.config.verbose);
		if (!isOk(res)) {
			return Err(res.data);
		}
		env.setConfigPath(this.config.path);
		return Ok(this);
	}

	setConfigOverrides(config: Record<keyof BaseConfig, unknown>) {
		const env = executionEnv.getInstance();
		env.setConfigOverrides(config);
		return this;
	}

	setTsConfigOverride(config: Record<keyof TSConfig, unknown>) {
		const env = executionEnv.getInstance();
		env.setTsOverrides(config);
		return this;
	}

	setGoConfigOverride(config: Record<keyof GoConfig, unknown>) {
		const env = executionEnv.getInstance();
		env.setGoOverrides(config);
		return this;
	}

	purgeEnvironment() {
		executionEnv.purge();
	}

	get _envConfig() {
		const env = executionEnv.getInstance();
		return env.ErrorExecContext;
	}

	async createExe(
		config: CreateApi
	): Promise<rustic.ResultEquipped<null, string>> {
		const result = await createApi(config, this.config);
		return rustic.equip(result);
	}

	async buildExe() {
		const result = await buildApi();
		return rustic.equip(result);
	}

	async runExe(args: RunApi) {
		const result = await runApi(args);
		return rustic.equip(result);
	}

	async version(increment: VeraceApi) {
		const result = await versionApi(increment);
		return rustic.equip(result);
	}
}

export { BaseConfig, APICONFIG };
