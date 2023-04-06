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
import rustic from "rustic";
import type { Result } from "rustic";
const { Err, isOk, Ok } = rustic;

import { infallablePromise } from "src/lib/infallable";
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
			.then(cfg => {
				if (!isOk(cfg)) {
					reject(cfg.data);
					return;
				}
				if (env.apiMode) {
					env.setApiResult({
						command: "build-exe",
						success: true,
						config: cfg.data,
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

const build = (): Promise<Result<BaseConfig, string>> => {
	const env = envWrapper.getInstance();
	const { log } = env;
	log().verbose("Build starting");
	return new Promise(resolve => {
		parseConfig("Build")
			.then((result): Promise<Result<boolean, string>> => {
				if (!isOk(result)) {
					resolve(Err(result.data));
					return;
				}
				log().verbose("Parsed Config");
				const { config: cfg } = env;
				if (cfg.hooks && cfg.hooks.preBuild != "")
					return parseHook(cfg.hooks.preBuild);
				else return infallablePromise<boolean>(true);
			})
			.then((status: Result<boolean, string>) => {
				if (!isOk(status)) {
					resolve(Err("Prebuild hook not completed successfully"));
				}
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
										resolve(Ok(cfg))
									);
								else resolve(Ok(cfg));
							})
							.catch(e => resolve(Err(e)));
						break;
					}
					case "go": {
						log().verbose("Go lang");

						buildGo()
							.then(() => {
								log().verbose("Go build done");
								if (cfg.hooks && cfg.hooks.postBuild != "")
									parseHook(cfg.hooks.postBuild).then(() =>
										resolve(Ok(cfg))
									);
								else resolve(Ok(cfg));
							})
							.catch(e => resolve(Err(e)));
						break;
					}
				}
			})
			.catch(e => {
				resolve(Err(e));
			});
	});
};
