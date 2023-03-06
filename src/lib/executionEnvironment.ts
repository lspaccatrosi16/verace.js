import type { APICONFIG } from "src/verace";
import { LoggerType, make_logger } from "./log";
import type { BaseConfig } from "./veraceConfig";

import path from "path";

export class ExecutionEnvironment {
	private _log: LoggerType;
	private _apiMode: boolean;
	private _config: BaseConfig;
	private _apiExecutionConfig: APICONFIG;
	private _veraceConfigPath: string = "./verace.json";

	constructor(testMode: boolean, apiMode: boolean) {
		const log = make_logger(testMode, apiMode);
		this._log = log;
		this._apiMode = apiMode;
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

		this._log(`Config path: ${path.join(process.cwd(), cpath)}`);
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
}
