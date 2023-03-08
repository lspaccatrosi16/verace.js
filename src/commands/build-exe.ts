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
