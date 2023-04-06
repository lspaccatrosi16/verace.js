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

import rustic from "rustic";
import type { Result } from "rustic";
const { Err, Ok } = rustic;
import type { APICONFIG } from "src/api";
import { LoggerType, make_logger } from "./log";
import type { BaseConfig } from "./veraceConfig";

import fs from "fs-extra";

import path from "path";

export type Commands = "build-exe" | "run-exe" | "create-exe" | "version";

export interface APIResult {
	command: Commands;
	success: boolean;
	config: BaseConfig;
}

export default class GetExecutionEnv {
	static instance: InternalExecutionEnvironment = null;

	constructor() {
		throw new Error("Use the getInstance method");
	}

	static getInstance(strict = false) {
		if (!this.instance && !strict) {
			this.instance = new InternalExecutionEnvironment();
		}
		return this.instance;
	}

	static purge() {
		console.log(`Purging execution instance. ID: ${this.instance.id}`);
		this.instance = null;
	}
}

export type ExecutionEnvironment = InternalExecutionEnvironment;

class InternalExecutionEnvironment {
	private _log: LoggerType;
	private _apiMode: boolean;
	private _config: BaseConfig;
	private _apiExecutionConfig: APICONFIG;
	private _veraceConfigPath = "";
	private _skipTest = false;
	private _setupDone = false;
	private _apiResult: APIResult;
	private _id = Math.floor(Math.random() * 1e10).toString(36);
	private _configOverrides = {};
	private _tsOverrides = {};
	private _goOverrides = {};
	private _verboseMode: boolean;

	setupInstance(
		testMode: boolean,
		apiMode: boolean,
		verboseMode: boolean
	): Result<void, string> {
		if (!this._setupDone) {
			console.log(`Setting up execution instance. ID: ${this._id}`);
			const log = make_logger(testMode, apiMode, verboseMode);
			this._log = log;
			this._apiMode = apiMode;
			this._setupDone = true;
			this._verboseMode = true;
			this.detectConfigType();
			return Ok(null);
		} else {
			return Err(
				"Can't create more than one instance at a time. Ensure that the promise to the previous api action is resolved before trying again ID: " +
					this._id
			);
		}
	}

	setConfig(cfg: BaseConfig) {
		this._config = cfg;
	}

	setConfigOverrides(ovr: Record<string, unknown>) {
		this._configOverrides = { ...this._configOverrides, ...ovr };
	}
	setTsOverrides(ovr: Record<string, unknown>) {
		this._tsOverrides = { ...this._tsOverrides, ...ovr };
	}
	setGoOverrides(ovr: Record<string, unknown>) {
		this._goOverrides = { ...this._goOverrides, ...ovr };
	}

	setApiExecutionConfig(cfg: APICONFIG) {
		if (this._apiMode) {
			this._apiExecutionConfig = cfg;
			this.setConfigPath(cfg.path);
		}
	}

	setConfigPath(cpath: string) {
		this._veraceConfigPath = cpath; // Detech whether is using a js or a json config and then test with bb

		this._log(`Config path: ${this.absolutePath(cpath)}. ID: ${this._id}`);
	}

	detectConfigType() {
		//defineconfig or json
		if (fs.existsSync(this.absolutePath("verace.config.mjs"))) {
			this.setConfigPath("verace.config.mjs");
		} else if (fs.existsSync(this.absolutePath("verace.json"))) {
			this.setConfigPath("verace.json");
		}
	}

	setSkipTest(skip: boolean) {
		this._skipTest = skip;
	}

	setApiResult(data: APIResult) {
		if (this.apiMode) {
			this._apiResult = data;
		}
	}

	resolveFromRoot(fp: string) {
		return path.join(this.wk, fp);
	}

	absolutePath(fp: string) {
		return path.join(process.cwd(), fp);
	}

	get apiExecResult() {
		if (this.apiMode) return this._apiResult;
		return null;
	}

	get log() {
		return this._log;
	}

	get apiMode() {
		return this._apiMode;
	}

	get config() {
		return {
			...this._config,
			...this._configOverrides,
			ts: {
				...this._config.ts,
				...this._tsOverrides,
			},
			go: {
				...this._config.go,
				...this._goOverrides,
			},
		};
	}

	get apiExecutionConfig() {
		return this._apiExecutionConfig;
	}

	get wk() {
		const dn = path.dirname(this._veraceConfigPath);
		return dn;
	}

	get confPath(): Result<string, string> {
		if (
			typeof this._veraceConfigPath == "string" &&
			this._veraceConfigPath != ""
		) {
			return Ok(this._veraceConfigPath);
		} else {
			return Err("No config path was provided");
		}
	}

	get skipTest() {
		return this._skipTest;
	}

	get id() {
		return this._id;
	}

	get ErrorExecContext() {
		return {
			id: this._id,
			api: this._apiMode,
			parsedConfig: this._config,
			configLocation: this._veraceConfigPath,
			apiExecConfig: this.apiExecutionConfig,
			configOverrides: {
				...this._configOverrides,
				ts: { ...this._tsOverrides },
				go: { ...this._goOverrides },
			},
			verbose: this._verboseMode,
		};
	}

	get entryPointPath() {
		if (this._config.entrypoint != "") return this._config.entrypoint;
		else {
			switch (this._config.lang) {
				case "go":
					return "main.go";

				case "ts":
					return "src/index.ts";
			}
		}
	}

	get entryPointName() {
		const paths = this.entryPointPath.split("/");
		return paths[paths.length - 1];
	}
}
