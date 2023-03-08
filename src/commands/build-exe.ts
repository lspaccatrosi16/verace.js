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

import { execSync } from "child_process";
import { Command } from "commander";
import buildGo from "lib/buildGo";
import buildTs from "lib/buildTs";
import { parseConfig } from "lib/parseConfig";
import { handleExecError } from "lib/common";
import type { BaseConfig } from "lib/veraceConfig";

import envWrapper from "lib/executionEnvironment";

export default function () {
	const env = envWrapper.getInstance();

	const be = new Command("build-exe").description(
		"Builds the project according to the verace.json file"
	);

	be.action(() => {
		const opts = be.optsWithGlobals();
		if (opts.path && opts.path != "") {
			env.setConfigPath(opts.path);
		}
		return wrapBuild();
	});

	return be;
}

const wrapBuild = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		const env = envWrapper.getInstance();

		build().then((cfg: BaseConfig) => {
			if (env.apiMode) {
				env.setApiResult({
					command: "build-exe",
					success: true,
					config: cfg,
				});
				resolve();
			}
			resolve();
		});
	});
};

const build = (): Promise<BaseConfig> => {
	const env = envWrapper.getInstance();

	const { log } = env;
	return new Promise(resolve => {
		parseConfig("Build")
			.then(cfg => {
				env.setConfig(cfg);
				if (cfg.hooks && cfg.hooks.preBuild != "")
					execHookCommand(cfg.hooks.preBuild);
				switch (cfg.lang) {
					case "ts": {
						buildTs().then(() => {
							if (cfg.hooks && cfg.hooks.postBuild != "")
								execHookCommand(cfg.hooks.postBuild);
							resolve(cfg);
						});
						break;
					}

					case "go": {
						buildGo().then(() => {
							if (cfg.hooks && cfg.hooks.postBuild != "")
								execHookCommand(cfg.hooks.postBuild);
							resolve(cfg);
						});
						break;
					}
				}
			})
			.catch(e => {
				log().danger(e);
				throw new Error();
			});
	});
};

const execHookCommand = (cmd: string) => {
	const env = envWrapper.getInstance();

	const { log } = env;
	log().info(`Executing hook: ` + cmd);
	try {
		execSync(cmd, { stdio: "inherit" });
	} catch (e) {
		log().danger("Error executing hook command: ");

		handleExecError(e, env);
	}
};
