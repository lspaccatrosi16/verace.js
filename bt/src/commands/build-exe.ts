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

import { Command } from "commander";
import buildGo from "lib/buildGo";
import buildTs from "lib/buildTs";
import envWrapper from "lib/executionEnvironment";
import { parseConfig } from "lib/parseConfig";

import { parseHook } from "lib/hooks";

import type { BaseConfig } from "lib/veraceConfig";
export default function () {
	const env = envWrapper.getInstance();

	const be = new Command("build-exe").description(
		"Builds the project according to the verace.json file"
	);

	be.alias("build");

	be.option("--skipPkg", "Skips the packaging step (overrides verace.json)");
	be.option(
		"--noHooks",
		"Disables the execution of hooks (overrides verace.json)"
	);

	be.action(() => {
		const opts = be.optsWithGlobals();

		if (opts.skipPkg) {
			env.setTsOverrides({ skipPkg: opts.skipPkg });
		}

		if (opts.noHooks) {
			env.setConfigOverrides({
				hooks: {
					preBuild: "",
					postBuild: "",
					prePkg: "",
				},
			});
		}
		return wrapBuild();
	});

	return be;
}

const wrapBuild = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		const env = envWrapper.getInstance();

		build()
			.then((cfg: BaseConfig) => {
				if (env.apiMode) {
					env.setApiResult({
						command: "build-exe",
						success: true,
						config: cfg,
					});
					resolve();
				}
				resolve();
			})
			.catch(e => {
				// if(e) env.log().danger(e.toString())
				reject(e);
			});
	});
};

const build = (): Promise<BaseConfig> => {
	const env = envWrapper.getInstance();
	const { log } = env;
	log().verbose("Build starting");
	return new Promise((resolve, reject) => {
		parseConfig("Build")
			.then(() => {
				log().verbose("Parsed Config");
				const { config: cfg } = env;
				if (cfg.hooks && cfg.hooks.preBuild != "")
					return parseHook(cfg.hooks.preBuild);
				else return true;
			})
			.then((status: boolean) => {
				log().verbose("Prebuild hook dealt with");

				if (!status) return;
				const { config: cfg } = env;
				switch (cfg.lang) {
					case "ts": {
						log().verbose("TS lang");

						buildTs()
							.then(() => {
								log().verbose("TS build done");
								if (cfg.hooks && cfg.hooks.postBuild != "")
									parseHook(cfg.hooks.postBuild).then(() =>
										resolve(cfg)
									);
								else resolve(cfg);
							})
							.catch(reject);
						break;
					}
					case "go": {
						log().verbose("Go lang");

						buildGo()
							.then(() => {
								log().verbose("Go build done");
								if (cfg.hooks && cfg.hooks.postBuild != "")
									parseHook(cfg.hooks.postBuild).then(() =>
										resolve(cfg)
									);
								else resolve(cfg);
							})
							.catch(reject);
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
