import { execSync } from "child_process";
import { Command } from "commander";
import buildGo from "lib/buildGo";
import buildTs from "lib/buildTs";
import { parseConfig } from "lib/parseConfig";
import { handleExecError } from "lib/common";
import type { ExecutionEnvironment } from "lib/executionEnvironment";
import type { BaseConfig } from "lib/veraceConfig";

export default function (env: ExecutionEnvironment) {
	const be = new Command("build-exe").description(
		"Builds the project according to the verace.json file"
	);

	be.argument("[path]", "Path to the verace.json file", "");

	be.action((path: string) => {
		if (path != "") {
			env.setConfigPath(path);
		}
		return wrapBuild(env);
	});

	return be;
}

const wrapBuild = (env: ExecutionEnvironment): Promise<void> => {
	const { log } = env;
	return new Promise((resolve, reject) => {
		build(env).then((cfg: BaseConfig) => {
			if (env.apiMode) {
				log().submitApiResult({
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

const build = (env: ExecutionEnvironment): Promise<BaseConfig> => {
	const { log } = env;
	return new Promise((resolve) => {
		parseConfig(env, "Build")
			.then((cfg) => {
				env.setConfig(cfg);
				if (cfg.hooks && cfg.hooks.preBuild != "") execHookCommand(cfg.hooks.preBuild, env);
				switch (cfg.lang) {
					case "ts": {
						buildTs(env).then(() => {
							if (cfg.hooks && cfg.hooks.postBuild != "")
								execHookCommand(cfg.hooks.postBuild, env);
							resolve(cfg);
						});
						break;
					}

					case "go": {
						buildGo(env).then(() => {
							if (cfg.hooks && cfg.hooks.postBuild != "")
								execHookCommand(cfg.hooks.postBuild, env);
							resolve(cfg);
						});
						break;
					}
				}
			})
			.catch((e) => {
				log().danger(e);

				process.exit(1);
			});
	});
};

const execHookCommand = (cmd: string, env: ExecutionEnvironment) => {
	const { log } = env;
	log().info(`Executing hook: ` + cmd);
	try {
		execSync(cmd, { stdio: "inherit" });
	} catch (e) {
		log().danger("Error executing hook command: ");

		handleExecError(e, env);
	}
};
