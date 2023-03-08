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

import type { APICONFIG } from "src/verace";
import { LoggerType, make_logger } from "./log";
import type { BaseConfig } from "./veraceConfig";

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
			console.log(
				`Creating new execution instance. ID: ${this.instance.id}`
			);
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
	private _veraceConfigPath: string = "./verace.json";
	private _skipTest = false;
	private _setupDone = false;
	private _apiResult: APIResult;
	private _id = Math.floor(Math.random() * 1e10).toString(36);

	setupInstance(testMode: boolean, apiMode: boolean) {
		if (!this._setupDone) {
			const log = make_logger(testMode, apiMode);
			this._log = log;
			this._apiMode = apiMode;
			this._setupDone = true;
		} else {
			throw new Error(
				"Can't create more than one instance at a time. Ensure that the promise to the previous api action is resolved before trying again ID: " +
					this._id
			);
		}
	}

	setConfig(cfg: BaseConfig) {
		this._config = cfg;
	}

	setApiExecutionConfig(cfg: APICONFIG) {
		if (this._apiMode) {
			this._apiExecutionConfig = cfg;
			this.setConfigPath(cfg.path);
		}
	}

	setConfigPath(cpath: string) {
		this._veraceConfigPath = cpath;

		this._log(
			`Config path: ${path.join(process.cwd(), cpath)}. ID: ${this._id}`
		);
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
		return this._config;
	}

	get apiExecutionConfig() {
		return this._apiExecutionConfig;
	}

	get wk() {
		const dn = path.dirname(this._veraceConfigPath);
		return dn;
	}

	get confPath() {
		return this._veraceConfigPath;
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
		};
	}
}
